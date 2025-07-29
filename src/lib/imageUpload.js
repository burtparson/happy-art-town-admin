// Image upload utility functions
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export const validateImage = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: 'File too large. Please select an image smaller than 5MB.' 
    };
  }

  return { isValid: true };
};

export const uploadImage = async (file, supabase, bucket = 'images') => {
  const validation = validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
      fileName: fileName
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const deleteImage = async (filePath, supabase, bucket = 'images') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};
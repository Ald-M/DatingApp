using System;
using CloudinaryDotNet.Actions;

namespace API.Interfaces;

public interface iPhotoService
{
    Task<ImageUploadResult> UploadPhotoAsync(IFormFile file);

    Task<DeletionResult> DeletePhotoAsync(string publicId);
}

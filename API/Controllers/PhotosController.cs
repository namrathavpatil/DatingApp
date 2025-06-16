using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace API.Controllers
{
    [Authorize]
    public class PhotosController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public PhotosController(DataContext context, IWebHostEnvironment environment, IConfiguration config)
        {
            _context = context;
            _environment = environment;
            _config = config;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhotoDto>>> GetPhotos()
        {
            var username = User.Identity.Name;
            var user = await _context.Users
                .Include(x => x.Photos)
                .SingleOrDefaultAsync(x => x.UserName == username);

            if (user == null) return NotFound();

            var photos = user.Photos.Select(p => new PhotoDto
            {
                Id = p.Id,
                Url = GetFullImageUrl(p.Url),
                IsMain = p.IsMain
            });

            return Ok(photos);
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            try
            {
                var username = User.Identity.Name;
                var user = await _context.Users
                    .Include(x => x.Photos)
                    .SingleOrDefaultAsync(x => x.UserName == username);

                if (user == null) return NotFound();

                if (file == null || file.Length == 0)
                    return BadRequest("No file uploaded");

                // Create a unique filename
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                
                // Ensure wwwroot/images directory exists
                var imagesPath = Path.Combine(_environment.WebRootPath, "images");
                if (!Directory.Exists(imagesPath))
                {
                    Directory.CreateDirectory(imagesPath);
                }

                var filePath = Path.Combine(imagesPath, fileName);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create photo record
                var photo = new Photo
                {
                    Url = $"/images/{fileName}",
                    IsMain = !user.Photos.Any(), // First photo is main
                    AppUserId = user.Id
                };
                

                user.Photos.Add(photo);
                await _context.SaveChangesAsync();

                return new PhotoDto
                {
                    Id = photo.Id,
                    Url = GetFullImageUrl(photo.Url),
                    IsMain = photo.IsMain
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private string GetFullImageUrl(string relativePath)
        {
            var baseUrl = _config["ApiUrl"] ?? "https://localhost:5001";
            return $"{baseUrl}{relativePath}";
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var username = User.Identity.Name;
            var user = await _context.Users
                .Include(x => x.Photos)
                .SingleOrDefaultAsync(x => x.UserName == username);

            if (user == null) return NotFound();

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
            if (photo == null) return NotFound();

            var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
            if (currentMain != null) currentMain.IsMain = false;

            photo.IsMain = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var username = User.Identity.Name;
            var user = await _context.Users
                .Include(x => x.Photos)
                .SingleOrDefaultAsync(x => x.UserName == username);

            if (user == null) return NotFound();

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
            if (photo == null) return NotFound();

            

            // Delete the file
            var filePath = Path.Combine(_environment.WebRootPath, photo.Url.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            _context.Photos.Remove(photo);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
} 
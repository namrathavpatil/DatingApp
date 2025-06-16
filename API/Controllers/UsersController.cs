using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using API.DTOs;
namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DataContext _context;

        public UsersController(DataContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await (from user in _context.Users
                            join photo in _context.Photos.Where(p => p.IsMain) 
                                on user.Id equals photo.AppUserId into userPhotos
                            from mainPhoto in userPhotos.DefaultIfEmpty()
                            select new UserDto
                            {
                                Id = user.Id,
                                UserName = user.UserName,
                                KnownAs = user.KnownAs,
                                Gender = user.Gender,
                                DateOfBirth = user.DateOfBirth,
                                City = user.City,
                                Country = user.Country,
                                Introduction = user.Introduction,
                                LookingFor = user.LookingFor,
                                Interests = user.Interests,
                                PhotoUrl = mainPhoto != null ? mainPhoto.Url : null,
                                Age = DateTime.Today.Year - user.DateOfBirth.Year - (user.DateOfBirth.Date > DateTime.Today.AddYears(-(DateTime.Today.Year - user.DateOfBirth.Year)) ? 1 : 0)
                            }).ToListAsync();

            return users;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppUser>> GetUsers(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        [HttpDelete("delete-all")]
        public async Task<ActionResult> DeleteAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            _context.Users.RemoveRange(users);
            await _context.SaveChangesAsync();
            return Ok("All users have been deleted");
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(AppUser updatedUser)
        {
            var username = User.Identity.Name;
            var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == username);
            if (user == null) return NotFound();

            user.Introduction = updatedUser.Introduction;
            user.LookingFor = updatedUser.LookingFor;
            user.Interests = updatedUser.Interests;
            user.City = updatedUser.City;
            user.Country = updatedUser.Country;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
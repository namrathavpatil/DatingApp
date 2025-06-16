using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class LikesController : BaseApiController
    {
        private readonly DataContext _context;

        public LikesController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes()
        {
            var username = User.Identity.Name;
            var user = await _context.Users
                .Include(x => x.LikedUsers)
                .ThenInclude(x => x.LikedUser)
                .SingleOrDefaultAsync(x => x.UserName == username);

            if (user == null) return NotFound();

            var likes = await _context.Likes
                .Where(l => l.SourceUserId == user.Id)
                .Select(l => new LikeDto
                {
                    Id = l.LikedUser.Id,
                    Username = l.LikedUser.UserName,
                    KnownAs = l.LikedUser.KnownAs,
                    PhotoUrl = l.LikedUser.Photos
                        .Where(p => p.IsMain)
                        .Select(p => p.Url)
                        .FirstOrDefault(),
                    Age = DateTime.Today.Year - l.LikedUser.DateOfBirth.Year - 
                        (l.LikedUser.DateOfBirth.Date > DateTime.Today.AddYears(-(DateTime.Today.Year - l.LikedUser.DateOfBirth.Year)) ? 1 : 0),
                    City = l.LikedUser.City,
                    Country = l.LikedUser.Country,
                    Gender = l.LikedUser.Gender,
                    Introduction = l.LikedUser.Introduction,
                    LookingFor = l.LikedUser.LookingFor,
                    Interests = l.LikedUser.Interests
                })
                .ToListAsync();

            return Ok(likes);
        }

        [HttpPost("{username}")]
        public async Task<ActionResult> AddLike(string username)
        {
            var sourceUsername = User.Identity.Name;
            var sourceUser = await _context.Users
                .Include(x => x.LikedUsers)
                .SingleOrDefaultAsync(x => x.UserName == sourceUsername);

            if (sourceUser == null) return NotFound();

            var likedUser = await _context.Users
                .SingleOrDefaultAsync(x => x.UserName == username);

            if (likedUser == null) return NotFound();

            if (sourceUser.LikedUsers.Any(x => x.LikedUserId == likedUser.Id))
                return BadRequest("You already like this user");

            var userLike = new UserLike
            {
                SourceUserId = sourceUser.Id,
                LikedUserId = likedUser.Id
            };

            sourceUser.LikedUsers.Add(userLike);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
} 
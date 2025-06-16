using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    public class MessagesController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly ILogger<MessagesController> _logger;

        public MessagesController(DataContext context, ILogger<MessagesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages()
        {
            try
            {
                var username = User.Identity.Name;
                _logger.LogInformation($"Getting messages for user: {username}");

                var user = await _context.Users
                    .Include(x => x.MessagesSent)
                    .Include(x => x.MessagesReceived)
                    .SingleOrDefaultAsync(x => x.UserName == username);

                if (user == null)
                {
                    _logger.LogWarning($"User not found: {username}");
                    return NotFound($"User {username} not found");
                }

                var messages = user.MessagesReceived
                    .Where(m => !m.RecipientDeleted)
                    .Concat(user.MessagesSent.Where(m => !m.SenderDeleted))
                    .OrderByDescending(m => m.MessageSent)
                    .Select(m => new MessageDto
                    {
                        Id = m.Id,
                        SenderId = m.SenderId,
                        SenderUsername = m.SenderUsername,
                        RecipientId = m.RecipientId,
                        RecipientUsername = m.RecipientUsername,
                        Content = m.Content,
                        DateRead = m.DateRead,
                        MessageSent = m.MessageSent
                    })
                    .ToList();

                _logger.LogInformation($"Found {messages.Count} messages for user {username}");
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting messages");
                return StatusCode(500, "An error occurred while retrieving messages");
            }
        }

        [HttpGet("thread/{username}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username)
        {
            try
            {
                var currentUsername = User.Identity.Name;
                _logger.LogInformation($"Getting message thread between {currentUsername} and {username}");

                var currentUser = await _context.Users
                    .Include(x => x.MessagesSent)
                    .Include(x => x.MessagesReceived)
                    .SingleOrDefaultAsync(x => x.UserName == currentUsername);

                if (currentUser == null)
                {
                    _logger.LogWarning($"Current user not found: {currentUsername}");
                    return NotFound($"User {currentUsername} not found");
                }

                var otherUser = await _context.Users
                    .SingleOrDefaultAsync(x => x.UserName == username);

                if (otherUser == null)
                {
                    _logger.LogWarning($"Other user not found: {username}");
                    return NotFound($"User {username} not found");
                }

                var messages = currentUser.MessagesReceived
                    .Where(m => m.SenderId == otherUser.Id && !m.RecipientDeleted)
                    .Concat(currentUser.MessagesSent.Where(m => m.RecipientId == otherUser.Id && !m.SenderDeleted))
                    .OrderBy(m => m.MessageSent)
                    .Select(m => new MessageDto
                    {
                        Id = m.Id,
                        SenderId = m.SenderId,
                        SenderUsername = m.SenderUsername,
                        RecipientId = m.RecipientId,
                        RecipientUsername = m.RecipientUsername,
                        Content = m.Content,
                        DateRead = m.DateRead,
                        MessageSent = m.MessageSent
                    })
                    .ToList();

                _logger.LogInformation($"Found {messages.Count} messages in thread between {currentUsername} and {username}");
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting message thread");
                return StatusCode(500, "An error occurred while retrieving the message thread");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
        {
            try
            {
                var username = User.Identity.Name;
                _logger.LogInformation($"Creating message from {username} to {createMessageDto.RecipientUsername}");

                var sender = await _context.Users
                    .SingleOrDefaultAsync(x => x.UserName == username);

                if (sender == null)
                {
                    _logger.LogWarning($"Sender not found: {username}");
                    return NotFound($"User {username} not found");
                }

                var recipient = await _context.Users
                    .SingleOrDefaultAsync(x => x.UserName == createMessageDto.RecipientUsername);

                if (recipient == null)
                {
                    _logger.LogWarning($"Recipient not found: {createMessageDto.RecipientUsername}");
                    return NotFound($"User {createMessageDto.RecipientUsername} not found");
                }

                var message = new Message
                {
                    SenderId = sender.Id,
                    SenderUsername = sender.UserName,
                    RecipientId = recipient.Id,
                    RecipientUsername = recipient.UserName,
                    Content = createMessageDto.Content,
                    MessageSent = DateTime.Now
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Message created successfully with ID: {message.Id}");
                return new MessageDto
                {
                    Id = message.Id,
                    SenderId = message.SenderId,
                    SenderUsername = message.SenderUsername,
                    RecipientId = message.RecipientId,
                    RecipientUsername = message.RecipientUsername,
                    Content = message.Content,
                    MessageSent = message.MessageSent
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating message");
                return StatusCode(500, "An error occurred while creating the message");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMessage(int id)
        {
            try
            {
                var username = User.Identity.Name;
                _logger.LogInformation($"Attempting to delete message {id} for user {username}");

                var user = await _context.Users
                    .Include(x => x.MessagesSent)
                    .Include(x => x.MessagesReceived)
                    .SingleOrDefaultAsync(x => x.UserName == username);

                if (user == null)
                {
                    _logger.LogWarning($"User not found: {username}");
                    return NotFound($"User {username} not found");
                }

                var message = user.MessagesSent
                    .Concat(user.MessagesReceived)
                    .FirstOrDefault(m => m.Id == id);

                if (message == null)
                {
                    _logger.LogWarning($"Message {id} not found for user {username}");
                    return NotFound($"Message {id} not found");
                }

                if (message.SenderId == user.Id)
                {
                    message.SenderDeleted = true;
                    _logger.LogInformation($"Marked message {id} as deleted by sender");
                }
                else if (message.RecipientId == user.Id)
                {
                    message.RecipientDeleted = true;
                    _logger.LogInformation($"Marked message {id} as deleted by recipient");
                }

                if (message.SenderDeleted && message.RecipientDeleted)
                {
                    _context.Messages.Remove(message);
                    _logger.LogInformation($"Permanently deleted message {id}");
                }

                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting message {id}");
                return StatusCode(500, "An error occurred while deleting the message");
            }
        }
    }
} 
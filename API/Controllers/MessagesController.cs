using System;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class MessagesController(IMessageRepository messageRepository, IMemberRepository memberRepository) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDTO createMessageDTO)
    {
        var sender = await memberRepository.GetMemberByIdAsync(User.GetMemberId());
        var recipient = await memberRepository.GetMemberByIdAsync(createMessageDTO.RecipientId);

        if(recipient == null || sender == null || sender.Id == createMessageDTO.RecipientId)
        {
            return BadRequest("Cannot send this message");
        }
        var message = new Message
        {
            SenderID = sender.Id,
            RecipientId = recipient.Id,
            Content = createMessageDTO.Content
        };

        messageRepository.AddMessage(message);

        if(await messageRepository.SaveAllAsync()) return message.ToDto();

        return BadRequest("Failed to send message");
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MessageDto>>> GetMessagesByContainer([FromQuery]MessageParams messageParams)
    {
        messageParams.MemberId = User.GetMemberId();
        return await messageRepository.GetMessagesForMember(messageParams);
    }

    [HttpGet("thread/{recipientId}")]
    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetMessageThread(string recipientId)
    {
        return Ok(await messageRepository.GetMessageThread(User.GetMemberId(), recipientId));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(string id)
    {
        var memberId = User.GetMemberId();
        var message = await messageRepository.GetMessage(id);
        if (message == null) return BadRequest("Cannot delete this message");
        if(message.SenderID != memberId && message.RecipientId != memberId) return BadRequest("You cannot delete this message");
        if(message.SenderID == memberId) message.SenderDeleted = true;
        if(message.RecipientId == memberId) message.RecipientDeleted = true;

        if (message is {SenderDeleted: true, RecipientDeleted: true })
        {
            messageRepository.DeleteMessage(message);
        }
        if(await messageRepository.SaveAllAsync()) return Ok();
        return BadRequest("Problem deleting the message");
    }
}

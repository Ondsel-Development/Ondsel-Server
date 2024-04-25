import _ from 'lodash';
import mongodb from 'mongodb';
import { BadRequest } from '@feathersjs/errors';
import { buildUserSummary } from '../users/users.distrib.js';

const validateMessagePayload = message => {
  if (!message) {
    throw new BadRequest('Message object is not defined');
  }
  if (!message.text) {
    throw new BadRequest('message.text field is mandatory');
  }
}

export const commitMessage = async context => {
  const messagePayload = context.data.message;
  validateMessagePayload(messagePayload);

  const { messages, messagesParticipants, showInPublicGallery } = await context.service.get(context.id, { query: { $select: ['messages', 'messagesParticipants'] } });

  if (showInPublicGallery) {
    throw new BadRequest('Public gallery models not allowed to post messages');
  }

  const message = {
    _id: new mongodb.ObjectId(),
    createdAt: Date.now(),
    createdBy: context.params.user._id,
    text: messagePayload.text,
  }

  messages.push(message);

  if (!messagesParticipants.some(user => user._id.equals(context.params.user._id))) {
    messagesParticipants.push(buildUserSummary(context.params.user));
  }

  context.data.messages = messages;
  context.data.messagesParticipants = messagesParticipants;

  context.data = _.omit(context.data, ['message']);
  return context;
}
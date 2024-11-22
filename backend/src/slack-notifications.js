// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios';


const sendMsgToSlack = async (slackWebhookUrl, msg) => {
  await axios({
    method: 'post',
    url: slackWebhookUrl,
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      text: msg
    }
  });
}

// Call in user's hooks create after
export const sendCreateAccountNotificationToSlack = async context => {
  const webhookUrl = context.app.get('slackWebhookUrl');
  if (webhookUrl) {
    await sendMsgToSlack(
      webhookUrl,
      `🎉 New User Alert! 🎉\n\nName: *${context.result.name}*\nEmail: *${context.result.email}*`
    )
  }
  return context;
}


export const sendNotificationToSlack = async (context, msg) => {
  const webhookUrl = context.app.get('slackWebhookUrl');
  if (webhookUrl) {
    await sendMsgToSlack(
      webhookUrl,
      msg
    )
  }
}
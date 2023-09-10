import Service from 'feathers-mailer';

export class EmailService  extends Service {
  constructor(transport, defaults) {
    super(transport, defaults)
  }
}

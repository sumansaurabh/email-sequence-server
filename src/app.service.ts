import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log("Hello World app service!")
    return 'Hello World app service!';
  }
}

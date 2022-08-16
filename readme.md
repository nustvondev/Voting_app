# Voting app

Đây là dự án với mục đích học tập của quá trình tìm hiểu xây dựng ứng dụng đánh giá, kiểm tra, bỏ phiếu xử lý theo thời gian thực, dựa trên websocket. 

<br />

---

<br />

## Mục lục

* [Tool và Framework được dùng trong dự án](#link-của-một-số-tools-và-frameworks-được-dùng-trong-dự-án)
* [Chạy ứng dụng](#chạy-ứng-dụng)
* [01 - Tổng Quan về "Architecture"](#01---tổng-quan-về-architecture)
* [02 - Thiết lập Rest API](#02---thiết-lập-rest-api)


<br />

---

<br />

## Link của một số Tools và Frameworks được dùng trong dự án

### Tổng quan
* [Typescript](https://www.typescriptlang.org/)
* [Docker](https://www.docker.com/products/docker-desktop)
* [Prettier](https://prettier.io/)
* [ESLint](https://eslint.org/docs/user-guide/getting-started)

### Frontend
* [Vite](https://vitejs.dev/)
* [React](https://reactjs.org/)
* [Valtio](https://github.com/pmndrs/valtio)
* [Wouter](https://github.com/molefrog/wouter)
* [Storybook](https://storybook.js.org/)
* [Socket.io Client](https://socket.io/docs/v4/client-api/)
* [Tailwind CSS](https://tailwindcss.com/)
* [react-use](https://github.com/streamich/react-use)

### Backend
* [NestJS](https://nestjs.com/)
* [Socket.io Server](https://socket.io/docs/v4/server-api/)
* [Redis-JSON](https://oss.redis.com/redisjson/)
* [Redis-JSON Docker Image](https://hub.docker.com/r/redislabs/rejson/)
* [JSON Web Token](https://jwt.io/)

**[⬆ Quay về Mục Lục](#mục-lục)**

<br />

---

<br />


## Chạy ứng dụng

Để chạy ứng dụng, bạn sẽ cần phải cài đặt một số công cụ hỗ trợ dưới đây:

Đầu tiên, cần có Docker hay Docker Desktop để có thể chạy lệnh `docker-compose`.

Thứ hai, cần NodeJS cho cả phía client hay server của ứng dụng. Khuyến nghị nên dùng [nvm](https://github.com/nvm-sh/nvm) hoặc [nvm-windows](https://github.com/coreybutler/nvm-windows) và đảm bảo tránh xung đột giữa các phiên bản Nodejs thì nên dùng phiên bản Nodejs v17.6.0 trong tệp [.nvmrc](/.nvmrc) trong thư mục gốc của dự án. Có thể chạy  `nvm use` để đảm bảo tính ổn định của phiên bản.

Để khởi động redis, ứng dụng Nest JS phía backend, ứng dụng React phía front-end thì trong thư mục gốc dự án ta chạy:

```sh
npm run start
```

Tệp `package.json` của thư mục gốc và các tập lệnh npm cơ bản chỉ để thuận tiện cho việc chạy tất cả các ứng dụng và cơ sở dữ liệu cùng một lúc.

**[⬆ Quay về Mục Lục](#mục-lục)**

<br />

---

<br />

## 01 - Tổng quan về "Architecture"

Hình ảnh bên dưới cung cấp tổng quan về các công cụ, ngôn ngữ hoặc frameworks được sử dụng để xây dựng ứng dụng này.

![Application Diagram](./resources//ApplicationOverview1.png)

### Ứng dụng phía Client

Ứng dụng phía Client nằm bên trong thư mục `client`. Ứng dụng dựng trên nền có sẵn. Ứng dụng sử dụng [Vite](https://vitejs.dev/) làm công cụ phát triển front-end và được cấu hình dưới dependency cơ bản, sử dụng [Tailwind CSS](https://tailwindcss.com/) cho việc thiết kế, các tệp cho cấu hình [ESLint](https://eslint.org/docs/user-guide/getting-started) để hoạt động với [React](https://reactjs.org/), [Typescript](https://www.typescriptlang.org/) và  [Prettier](https://prettier.io/),.. Chạy trên cổng 8080.

### Ứng dụng phía Server 

Ứng dụng phía Server nằm bên trong thư mục `server`. Ứng dụng này được thiết lập để chạy [NestJS] (https://nestjs.com/), là framework để xây dựng máy chủ NodeJS phía ứng dụng Server. Dự án này cũng sử dụng cấu hình tương tự ([ESLint](https://eslint.org/docs/user-guide/getting-started), [Prettier](https://prettier.io/), [Typescript](https://www.typescriptlang.org/)) giống như phía Client. Chạy trên cổng 3000.

**[⬆ Quay về Mục Lục](#mục-lục)**

<br />

---

<br />

## 02 - Thiết lập Rest API

### Imports 

Cấu hình biến môi trường cho CORS. Ở đây sẽ tiến hành hard-code cổng port của `CORS` . Tiến hành cấu hình file [.env](../server/.env).

```toml
PORT=3000
CLIENT_PORT=8080
REDIS_HOST=localhost
```

Thay vì truyền đối tượng CORS, ta ta có thể truy cập vào các đối tượng con có origin và chỉ định các cổng của client đến từ `ConfigService`. Sau đó tiến hành cấu hình động CORS cho `app`.

```ts
  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT'));
  const clientPort = parseInt(configService.get('CLIENT_PORT'));
  app.enableCors({
    origin: [
      `http://localhost:${clientPort}`,
      new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
    ],
  });
  await app.listen(port);
```

### Tạo Polls Module

Tạo thư mục `polls` chứa chức năng của ứng dụng. Trong thư mục `polls` tiến hành tạo file [polls.module.ts](../server/src/polls/polls.module.ts).

Import `Module, ConfigModule` để decorator từ `@nestjs`. 

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
```

Sau đó tiến hành tạo lớp `PollsModule`.


```ts
@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [],
})
export class PollsModule {}
```

Sau khi có Polls module, chúng ta cần ứng dụng có thể biết nó. Vì thế, chúng ta sẽ tiến hành đăng kí import module này vào file [app.module.ts](../server/src/app.module.ts) .

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PollsModule } from './polls/polls.module';
@Module({
  imports: [ConfigModule.forRoot(), PollsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### Thêm Polls Controller với Endpoints

Tạo file [polls.controller.ts](../server/src/polls/polls.controller.ts). Như các lớp mẫu, ta tiến hành tạo lớp `polls` controller. Chúng ta decorate controller này với Nest's built-in `@Controller` decorator. 

```ts
import { Controller, Logger, Post, Body } from '@nestjs/common';
@Controller('polls')
export class PollsController {
}
```

Sau đó tiến hành định nghĩa các route cho create, join, rejoin trong việc bỏ phiếu nhứ sau.

```ts
@Controller('polls')
export class PollsController {
  @Post()
  async create() {
    Logger.log('Create!');
  }
  @Post('/join')
  async join() {
    Logger.log('Join!');
  }
  @Post('/rejoin')
  async rejoin() {
    Logger.log('Rejoin!');
  }
}
```

*Sau đó tiến hành test với Postman lần lượt post request đến `localhost:8080/polls`, `localhost:8080/polls/join`, `localhost:8080/polls/rejoin*

### Định nghĩa Request Body cho Endpoints

Tạo file [dtos.ts](../server/src/polls/dtos.ts) và decorator như sau.

```ts
import { Length, IsInt, IsString, Min, Max } from 'class-validator';
export class CreatePollDto {
  @IsString()
  @Length(1, 100)
  topic: string;
  @IsInt()
  @Min(1)
  @Max(5)
  votesPerVoter: number;
  @IsString()
  @Length(1, 25)
  name: string;
}
export class JoinPollDto {
  @IsString()
  @Length(6, 6)
  pollID: string;
  @IsString()
  @Length(1, 18)
  name: string;
}
```

Quay về polls controller điều chỉnh lại các lớp.

```ts
@Controller('polls')
export class PollsController {
  @Post()
  async create(@Body() createPollDto: CreatePollDto) {
    Logger.log('Create!');
    return createPollDto;
  }
  @Post('/join')
  async join(@Body() joinPollDto: JoinPollDto) {
    Logger.log('Join!');
    return joinPollDto;
  }
  @Post('/rejoin')
  async rejoin() {
    Logger.log('Rejoin!');
    return {
      message: 'rejoin endpoint',
    };
  }
}
```

Sau đó tiến hành import `PollsController` trong file [polls.module.ts](../server/src/polls/polls.module.ts).

```ts
import { PollsController } from './polls.controller';
@Module({
  imports: [ConfigModule],
  controllers: [PollsController],
  providers: [],
})
export class PollsModule {}
```

Sau đó tiến hành test các endpoints. Ta nhận về các kết quả như sau:



*Tạo câu hỏi.*

![Create Polls](./resources//createpolls.jpg)

*Người chơi tham gia.*

![Join Player Polls](./resources//joinpolls.jpg)

*Người chơi tham gia lại.*

![Rejoin Polls](./resources//rejoinpolls.jpg)


**[⬆ Quay về Mục Lục](#mục-lục)**

<br />

---

<br />

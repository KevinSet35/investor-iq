import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
    private readonly users: User[] = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
        },
    ];

    findAll(): User[] {
        return this.users;
    }

    findOne(id: string): User {
        const user = this.users.find((user) => user.id === id);
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
        return user;
    }
}

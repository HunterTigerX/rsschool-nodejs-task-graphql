import { UUID } from 'crypto';

export interface postDto {
    dto: {
        title: string;
        content: string;
        authorId: UUID;
    }

}

export interface userDto {
    dto: {
    name: string;
    balance: number;
    }
}

export interface profileDto {
    dto: {
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: string;
    userId: UUID;
    }
}


export interface changePostDto {

        title: string;
        content: string;
        authorId: UUID;


}

export interface changeUserDto {

    name: string;
    balance: number;

}

export interface changeProfileDto {
    
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: string;
    userId: UUID;

}


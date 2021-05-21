import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserType } from '../enums/user-type.enum';

@Schema()
export class User extends Document{

    @Prop({type : String,required : true,unique : true,trim:true})
    userName : string;

    @Prop({type : String,required : true,trim:true,minLength : 6})
    password : string;
    
    @Prop({type : String , enum : UserType,default : UserType.Standart})
    userType : string;

    @Prop({type : String})
    bioText : string;

    @Prop({type : String})
    profilePicture : string;

    @Prop({ type : Date,default: new Date(Date.now())})
    registeredAt: Date;

    validatePassword : Function;

}

export const UserSchema = SchemaFactory.createForClass(User)

//parametre olarak gonderilen sifre ile user in sifresini karsilastiriyor
UserSchema.methods.validatePassword = function(password: string) : Promise<boolean> {
    return bcrypt.compare(password,this.password)
}

//userin sifresini database kaydetmeden once hashliyor
UserSchema.pre<User>('save',async function(next) {

    let user:User = this;
    //password guncellenmediyse ve kullanici yeni degilse sonraki middleware geciyor
    if(!user.isModified('password') || !user.isNew){
        next()
    }

    //userin passwordunu hashliyor
    user.password = await bcrypt.hash(user.password, 12);
    //sonraki middleware geciyor
    next();
});
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  location: String,
});

userSchema.pre('save', async function () {
  console.log('Users password:', this.password);
  this.password = await bcrypt.hash(this.password, 5);
  console.log('Hashed password:', this.password);
  // 여기서 this의 의미는 create 되는 User를 가리킴
});

const User = mongoose.model('user', userSchema);

export default User;

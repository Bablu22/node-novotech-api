import mongoose from "mongoose";
const schema = mongoose.Schema;

const userSchema = new schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    orders: [{ type: schema.Types.ObjectId, ref: "Order" }],
    wishList: [{ type: schema.Types.ObjectId, ref: "WishList" }],
    isAdmin: { type: Boolean, default: false },
    hasShippingAddress: { type: Boolean, default: false },
    type: { type: String, default: "user", enum: ["user", "manager", "admin"] },
    shippingAddress: [
      {
        firstName: { type: String },
        lastName: { type: String },
        address: { type: String },
        city: { type: String },
        country: { type: String },
        postalCode: { type: String },
        province: { type: String },
        phone: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

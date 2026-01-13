import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: [true, 'Gig ID is required']
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer ID is required']
    },
    message: {
      type: String,
      required: [true, 'Bid message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Bid price is required'],
      min: [1, 'Price must be at least $1']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'hired', 'rejected'],
        message: 'Status must be pending, hired, or rejected'
      },
      default: 'pending'
    },
    deliveryTime: {
      type: Number, // in days
      required: [true, 'Delivery time is required'],
      min: [1, 'Delivery time must be at least 1 day']
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for faster queries
bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true }); // One bid per freelancer per gig
bidSchema.index({ gigId: 1, status: 1 });
bidSchema.index({ freelancerId: 1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;

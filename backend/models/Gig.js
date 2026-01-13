import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gig title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Gig description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [1, 'Budget must be at least $1']
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required']
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'assigned'],
        message: 'Status must be either open or assigned'
      },
      default: 'open'
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    deadline: {
      type: Date,
      default: null
    },
    hiredFreelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
gigSchema.index({ status: 1 });
gigSchema.index({ ownerId: 1 });
gigSchema.index({ title: 'text', description: 'text' }); // Text search

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;

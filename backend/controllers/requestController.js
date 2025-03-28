// /controllers/requestController.js

const mongoose = require('mongoose')
const RequestModel = require('../models/requestModel');
const Client = require('../models/clientModel');  // Assuming your Client model is in this path
const { level } = require('npmlog');


// Helper function to get the required number of links based on the user's level
function getRequiredLinksForLevel(level) {
    switch (level) {
        case 0: return 2;
        case 1: return 4;
        case 2: return 8;
        case 3: return 10;
        case 4: return 10;
        case 5: return 10;
        case 6: return 10;
        case 7: return 10;
        case 8: return 10;
        case 9: return 10;
        default: return level * 10 + 2;
    }
}
 

// newController
exports.sendRequest = async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    // Validate input data
    if (!receiverId) {
        return res.status(400).json({ msg: "Receiver ID is required." });
    }

    // Ensure sender and receiver are not the same
    if (senderId === receiverId) {
        return res.status(400).json({
            msg: "Receiver ID should be different from Sender ID.",
        });
    }

    try {
        // Fetch sender and receiver details
        const [sender, receiver] = await Promise.all([
            Client.findById(senderId),
            Client.findById(receiverId),
        ]);
        
        if (!sender || !receiver) {
            return res.status(404).json({ msg: "Sender or Receiver not found." });
        }
        
        // Ensure sender is activated
        if (!sender.activate) {
            return res.status(400).json({ msg: "You need to activate your account to send requests." });
        }
        
        // Ensure receiver is activated
        if (!receiver.activate) {
            return res.status(400).json({ msg: "The receiver must activate their account to receive requests." });
        }
        
        
        // Check how many requests the receiver has already received
        const receiverRequestsCount = await RequestModel.countDocuments({
            receiverId,
            status: 'pending',
        });
        
        // Limit for requests a receiver can have before accepting them
        const requestLimit = 1; // Adjust this limit as needed
        
        if (receiverRequestsCount >= requestLimit) {
            return res.status(400).json({
                msg: `The receiver has already received ${receiverRequestsCount} pending request(s). They must accept one before receiving more.`,
            });
        }
        
        // Check if the request already exists
        const existingRequest = await RequestModel.findOne({ senderId:senderId, receiverId:receiverId,level:sender.level });  
       
              
      if (existingRequest) {

            return res.status(400).json({ msg: "Request already sent." });
        }

        // Create a new request
        const newRequest = new RequestModel({ senderId, receiverId , level:sender.level  });
        const savedRequest = await newRequest.save();
        return res.status(201).json({
            msg: "Request sent successfully.",
            data: savedRequest,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "An error occurred.", error: error.message });
    }
};



exports.acceptRequest = async (req, res) => {
    const requestId = req.params.requestId || req.params.epin;

    const userId = req.user.id;
    

    try {
        const request = await RequestModel.findById(requestId);

        if (!request || request.receiverId.toString() !== userId) {
            return res.status(403).json({ msg: "Invalid request." });
        }

        const sender = await Client.findById(request.senderId);

        // Ensure the sender and receiver are at the same level
        const receiver = await Client.findById(userId);

        if (receiver.level>9){
            receiver.activate = false;
            receiver.halt = true ; 
            
            await receiver.save()

            return res.status(200).json({
                success:false,
                msg : "You have completed your all levels and you have Rejoin this Network, if you start again"
            })
        }

         if (receiver.level > 0 && sender.level === 0) {
            request.status = 'accepted';
            request.updatedAt = Date.now();
            await request.save();

            return res.status(200).json({
                msg: "Request accepted successfully.",
                data: request
            });
        }

        // Ensure sender is activated
        if (!sender.activate) {
            return res.status(400).json({ msg: "You need to activate your account to send requests." });
        }
        // Ensure receiver is activated
        if (!receiver.activate) {
            return res.status(400).json({ msg: "The receiver must activate their account to receive requests." });
        }

        request.status = 'accepted';
        request.updatedAt = Date.now();

        await request.save();

        receiver.newLinksReceived = receiver.newLinksReceived + 1;

        if (receiver.level >=1 &&  receiver.newLinksReceived === 2) {

            receiver.halt = true;
            await receiver.save();
        }
        if(sender.halt === true){
            sender.halt = false;
            sender.save();
        }
        // Check if the user has reached the threshold for level-up
        if (receiver.newLinksReceived >= getRequiredLinksForLevel(receiver.level)) {
            // Automatically level up the user if they have enough links
            receiver.level += 1;
            receiver.levelUpdateAt = Date.now()
            receiver.newLinksReceived = 0;  // Reset the new links count for the next level
            receiver.levelUpRequestStatus = false;  // Reset level-up request status

            // Save the updated user details
            await receiver.save();

            return res.status(200).json({
                msg: `Congratulations! You've reached level ${receiver.level}.`,
                data: receiver
            });
        }

        await receiver.save();

        return res.status(200).json({
            msg: "Request accepted successfully.",
            data: request
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "An error occurred.", error: error.message });
    }
};
// Reject a request
exports.rejectRequest = async (req, res) => {
    const requestId = req.params.requestId;
    const userId = req.user.id;

    try {

       // Ensure sender is activated
       const user = await Client.findById(userId)
       if (user.activate === false) {
           return res.status(400).json({ msg: "You need to activate your account to delete requests." });
       } 

        const request = await RequestModel.findById(requestId);
        if (!request) {
            return res.status(404).json({ msg: "Request not found." });
        }

        if (request.receiverId.toString() !== userId) {
            return res.status(403).json({ msg: "You can only reject requests sent to you." });
        }

        request.status = 'rejected';
        request.updatedAt = Date.now();
        const updatedRequest = await request.save();

        return res.status(200).json({ msg: "Request rejected.", data: updatedRequest });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "An error occurred.", error: error.message });
    }
};

// Get all requests for a user (sent or received)

exports.mygetRequests = async (req, res) => {

    const userId = req.user.id;

    try {
        const requests = await RequestModel.find({
            $or: [
                // { senderId: userId },
                 { receiverId: userId }]

        }).populate('senderId receiverId', 'name epin email'); // Populate sender and receiver details


        return res.status(200).json({ data: requests });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "An error occurred.", error: error.message });
    }
};

exports.getRequests = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch the user data to check their current level and the number of accepted requests
        const user = await Client.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found." });
        }

        // Check how many accepted requests the user has at their current level
        const acceptedRequestsCount = await RequestModel.countDocuments({
            receiverId: userId,
            status: 'accepted',
            level: user.level
        });

        // Check how many requests the user has already received (accepted requests)
        const receivedRequestsCount = await RequestModel.countDocuments({
            receiverId: userId,
            status: 'accepted',
            level: user.level
        });

        // If the user has already received two requests, they can't receive more until they send a request and it is accepted
        if (receivedRequestsCount >= 2) {
            // Update the `receivedRequestsAt` timestamp if not already set
            if (!user.receivedRequestsAt) {
                user.receivedRequestsAt = Date.now();
                await user.save();
            }

            // Set `halt` to true after receiving two requests
            user.halt = true;
            await user.save();

            // Check if the user has sent a request and whether that request is accepted
            const sentRequest = await RequestModel.findOne({
                senderId: userId,
                status: 'accepted',
                level: user.level
            });

            // If no request has been accepted, the user can't receive more requests
            if (!sentRequest) {
                return res.status(400).json({
                    msg: "You need to send a request and have it accepted before you can receive more requests."
                });
            }
        } else {
            // If the user hasn't yet received two requests, ensure `halt` is false
            user.halt = false;
            await user.save();
        }

        // Fetch all pending requests for the user to receive, only those at the same level
        const pendingRequests = await RequestModel.find({
            receiverId: userId,
            status: 'pending',
            level: user.level
        }).populate('senderId', 'name epin email');

        return res.status(200).json({
            msg: "You can now view pending requests.",
            pendingRequests: pendingRequests
        });

    } catch (error) {
        console.error("Error fetching requests:", error);
        return res.status(500).json({ msg: "An error occurred.", error: error.message });
    }
};


exports.sendRequestToLeveledUpUser = async (req, res) => {
    const { receiverId } = req.body;  // receiverId will be passed in the request body
    const senderId = req.user.id;     // senderId comes from JWT token (authenticated user) 

    if (!receiverId) {
        return res.status(400).json({ msg: "Receiver ID is required." });
    }

    try {
        // Fetch the sender and receiver users from the database
        const sender = await Client.findById(senderId);
        const receiver = await Client.findById(receiverId);

        // Check if sender and receiver exist
        if (!sender || !receiver) {
            return res.status(404).json({ msg: "Sender or Receiver not found." });
        }

        // Ensure the sender is activated
        if (!sender.activate) {
            return res.status(400).json({ msg: "You need to activate your account to send requests." });
        }

        // Ensure the receiver is activated
        if (!receiver.activate) {
            return res.status(400).json({ msg: "Receiver needs to activate their account to receive requests." });
        }

        // Check if sender and receiver are at the same level

        // Check if a request already exists between sender and receiver
        const existingRequest = await RequestModel.findOne({ senderId, receiverId });
        if (existingRequest) {
            return res.status(400).json({ msg: "Request already sent." });
        }

        // Create a new request
        const newRequest = new RequestModel({
            senderId,
            receiverId,
            status: 'pending',  // Status will be 'pending' initially
        });

        // Save the request
        const savedRequest = await newRequest.save();

        return res.status(201).json({ msg: "Request sent successfully.", data: savedRequest });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "An error occurred.", error: error.message });
    }
};

exports.clientFinancialDetails = async(req,res) =>{

    const  {epin}  = req.query;
    
  
    
    try {
        
        const client = await Client.findOne( {epin : epin} ).select(
          "number accountNo accountHolderName ifscCode bankName branchName googlePay phonePe"
        );
    
        if (!client) {
          return res.status(404).json({ message: "Client not found" });
        }
    
        res.status(200).json({
          phoneNumber: client.number,
          financialDetails: {
            accountNo: client.accountNo,
            accountHolderName: client.accountHolderName,
            ifscCode: client.ifscCode,
            bankName: client.bankName,
            branchName: client.branchName,
            googlePay: client.googlePay,
            phonePe: client.phonePe,
          },
        });
      } catch (error) {
       
        
        res.status(500).json({ message: "Error fetching client details", error });
      }
    };

exports.clientProfileDetails = async(req,res) =>{

    const { epin }  = req.query;
    console.log(epin,"epin");
    
    try {
        
        const client = await Client.findOne( {epin : epin} ).select(
          "name email city address state number country"
        );
    
        if (!client) {
          return res.status(404).json({ message: "Client not found" });
        }
    
        res.status(200).json({
            name: client.name,
            email: client.email,
            number: client.number,
            country : client.country,
            city: client.city,
            address: client.address,
            state: client.state,
            
        });
      } catch (error) {
       
        
        res.status(500).json({ message: "Error fetching client details", error });
      }
    };

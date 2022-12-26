import connectDB from 'src/middleware/mongodb';
import User from "src/models/User";

const handler = async (req, res) => {
    if (req.method === 'GET') {
        try {
            let user = await User.findOne({
                address: req.query.address
            });
            if (user) {
                return res.status(200).send(user);
            } else {
                return res.status(400).send({});

            }
        } catch (error) {
            return res.status(500).send(error.message);
        }
    } else {
        res.status(422).send('req_method_not_supported');
    }
};

export default connectDB(handler);
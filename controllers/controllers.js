const saySomething = (req, res, next) => {
    res.status(200).json({
        body: 'Hello from the server!',
    });
};

const pools = (req,res,next) => {
    res.status(200).json({
        rows: [[2, 'morsowanie nad Bałtykiem', 'Bałtycka 69'],
        [3,'morsowanie na mokotowskim','Pole Mokotowskie 42']]
    });
}

module.exports.saySomething = saySomething;
module.exports.pools = pools;
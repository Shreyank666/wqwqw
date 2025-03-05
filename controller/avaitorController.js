const CrashAviator = require('../models/crashAviator');

// Create a new crash entry
exports.createCrashEntry = async (req, res) => {
   
    try {
        const { round_id, crashMultiplier } = req.body;
        const newEntry = new CrashAviator({ round_id, crashMultiplier });
        await newEntry.save();
        res.status(201).json({ success: true, data: newEntry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




exports.getAllCrashEntries = async (req, res) => {
    try {
        // Fetch the last two entries
        const lastTwoEntries = await CrashAviator.find().sort({ createdAt: -1 }).limit(2);
        
        if ( lastTwoEntries.length === 0 || lastTwoEntries.length === 2 && lastTwoEntries[0].crashMultiplier === lastTwoEntries[1].crashMultiplier) {
            // Generate a new random crash multiplier (example: between 1.01 and 10)
            const newMultiplier = (Math.random() * (30 - 1.01) + 1.01).toFixed(2);

            // Create a new entry with the generated crashMultiplier
            await CrashAviator.create({ crashMultiplier: newMultiplier });

            console.log(`New crashMultiplier generated: ${newMultiplier}`);
        }

        // Fetch and return the latest entries (after potential new entry)
        const entry = await CrashAviator.findOne().sort({ createdAt: -1 }).limit(1);

        res.status(200).json({ success: true, data: entry });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};





exports.getAllCrashLatestEntries = async (req, res) => {
    try {
        const entries = await CrashAviator.findOne().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: entries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single crash entry by ID
exports.getCrashEntryById = async (req, res) => {
    try {
        const entry = await CrashAviator.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }
        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCrashEntryByGameId = async (req, res) => {
    try {
        const { round_id } = req.params
        const entry = await CrashAviator.findOne({ round_id: round_id });
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }
        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a crash entry by ID
exports.deleteCrashEntry = async (req, res) => {
    try {
        const entry = await CrashAviator.findByIdAndDelete(req.params.id);
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }
        res.status(200).json({ success: true, message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



exports.resetAviatorGame = async (req, res) => {
    try {
        await CrashAviator.deleteMany({});
        res.status(200).json({ message: "Game reset successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
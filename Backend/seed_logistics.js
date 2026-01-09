const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Warehouse = require('./models/Warehouse');
const NfcDealer = require('./models/NfcDealer');

dotenv.config({ path: './Backend/.env' });

const warehouses = [
    {
        name: "Central Hub Hyderabad",
        address: "Plot 42, Hitech City Main Rd, Madhapur",
        city: "Hyderabad",
        state: "Telangana",
        zipCode: "500081",
        location: { type: "Point", coordinates: [78.3850, 17.4401] }, // Approx Hitech City
        contact_number: "+91 98765 43210",
        manager_name: "Ramesh Gupta"
    },
    {
        name: "Secunderabad Storage Unit",
        address: "12-5, MG Road, Secunderabad",
        city: "Secunderabad",
        state: "Telangana",
        zipCode: "500003",
        location: { type: "Point", coordinates: [78.5000, 17.4399] }, // Approx Secunderabad
        contact_number: "+91 91234 56789",
        manager_name: "Suresh Reddy"
    }
];

const dealers = [
    {
        name: "TechTags Solutions",
        address: "Shop 10, Computer Market, Abids",
        city: "Hyderabad",
        location: { type: "Point", coordinates: [78.4744, 17.3850] }, // Approx Abids
        rate_per_tag: 25, // INR
        contact_number: "+91 88888 77777",
        amazon_link: "https://www.amazon.in/s?k=nfc+tags",
        flipkart_link: "https://www.flipkart.com/search?q=nfc+tags"
    },
    {
        name: "Smart Chip Vendors",
        address: "Gachibowli Electronics Park",
        city: "Hyderabad",
        location: { type: "Point", coordinates: [78.3600, 17.4400] }, // Approx Gachibowli
        rate_per_tag: 30, // INR
        contact_number: "+91 99999 66666",
        amazon_link: "https://www.amazon.in/s?k=nfc+sticker",
        flipkart_link: "https://www.flipkart.com/search?q=nfc+sticker"
    }
];

const seedLogistics = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');

        // Clear existing
        await Warehouse.deleteMany({});
        await NfcDealer.deleteMany({});
        console.log('Cleared existing logistics data');

        // Insert new
        await Warehouse.insertMany(warehouses);
        await NfcDealer.insertMany(dealers);
        console.log('Seeded Warehouses and Dealers');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedLogistics();

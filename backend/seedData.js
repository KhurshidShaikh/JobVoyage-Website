import mongoose from 'mongoose';
import { Company } from './models/Company.js';
import { Job } from './models/Job.js';
import { User } from './models/User.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const sampleUsers = [
    {
        fullname: "Rajesh Kumar",
        email: "rajesh@infosys.com",
        phoneNumber: 9876543210,
        password: "password123",
        role: "Employer"
    },
    {
        fullname: "Priya Sharma",
        email: "priya@tcs.com",
        phoneNumber: 9876543211,
        password: "password123",
        role: "Employer"
    },
    {
        fullname: "Amit Patel",
        email: "amit@wipro.com",
        phoneNumber: 9876543212,
        password: "password123",
        role: "Employer"
    },
    {
        fullname: "Sneha Gupta",
        email: "sneha@techm.com",
        phoneNumber: 9876543213,
        password: "password123",
        role: "Employer"
    },
    {
        fullname: "Vikram Singh",
        email: "vikram@hcl.com",
        phoneNumber: 9876543214,
        password: "password123",
        role: "Employer"
    },
    {
        fullname: "Anita Reddy",
        email: "anita@mindtree.com",
        phoneNumber: 9876543215,
        password: "password123",
        role: "Employer"
    }
];

const sampleCompanies = [
    {
        name: "Infosys Limited",
        description: "Global leader in next-generation digital services and consulting",
        website: "https://infosys.com",
        location: "Bangalore, Karnataka",
        logo: "https://via.placeholder.com/100x100?text=INFY"
    },
    {
        name: "Tata Consultancy Services",
        description: "IT services, consulting and business solutions organization",
        website: "https://tcs.com",
        location: "Mumbai, Maharashtra",
        logo: "https://via.placeholder.com/100x100?text=TCS"
    },
    {
        name: "Wipro Technologies",
        description: "Leading global information technology, consulting and business process services company",
        website: "https://wipro.com",
        location: "Bangalore, Karnataka",
        logo: "https://via.placeholder.com/100x100?text=WIPRO"
    },
    {
        name: "Tech Mahindra",
        description: "Digital transformation, consulting and business re-engineering services",
        website: "https://techmahindra.com",
        location: "Pune, Maharashtra",
        logo: "https://via.placeholder.com/100x100?text=TM"
    },
    {
        name: "HCL Technologies",
        description: "Global technology company providing industry-transforming capabilities",
        website: "https://hcltech.com",
        location: "Noida, Delhi NCR",
        logo: "https://via.placeholder.com/100x100?text=HCL"
    },
    {
        name: "Mindtree Limited",
        description: "Global technology consulting and services company",
        website: "https://mindtree.com",
        location: "Bangalore, Karnataka",
        logo: "https://via.placeholder.com/100x100?text=MT"
    }
];

const sampleJobs = [
    {
        title: "Frontend Developer",
        description: "We are looking for a skilled Frontend Developer to join our team in Bangalore. You will be responsible for building user-facing web applications using modern JavaScript frameworks like React and Angular.",
        requirements: ["React", "JavaScript", "HTML", "CSS", "Git", "TypeScript"],
        salary: "600000-1200000",
        location: "Bangalore, Karnataka",
        jobType: "Full-time",
        experienceLevel: 2,
        position: 3
    },
    {
        title: "Backend Developer",
        description: "Join our backend team in Mumbai to build scalable server-side applications. Experience with Node.js, Java, and databases required.",
        requirements: ["Node.js", "Java", "Spring Boot", "MongoDB", "MySQL", "REST APIs"],
        salary: "800000-1500000",
        location: "Mumbai, Maharashtra",
        jobType: "Full-time",
        experienceLevel: 3,
        position: 2
    },
    {
        title: "Full Stack Developer",
        description: "Looking for a versatile developer in Pune who can work on both frontend and backend technologies. Experience with MEAN/MERN stack preferred.",
        requirements: ["React", "Node.js", "MongoDB", "JavaScript", "Express", "Angular"],
        salary: "900000-1800000",
        location: "Pune, Maharashtra",
        jobType: "Full-time",
        experienceLevel: 4,
        position: 2
    },
    {
        title: "Senior Frontend Developer",
        description: "Lead frontend development initiatives in our Delhi NCR office. Work with cutting-edge technologies and mentor junior developers.",
        requirements: ["React", "Vue.js", "JavaScript", "TypeScript", "Redux", "Webpack"],
        salary: "1200000-2200000",
        location: "Noida, Delhi NCR",
        jobType: "Full-time",
        experienceLevel: 5,
        position: 1
    },
    {
        title: "Backend Developer - Java",
        description: "Develop robust backend systems using Java and Spring framework in our Hyderabad office. Work on microservices architecture.",
        requirements: ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Redis", "Kafka"],
        salary: "1000000-1800000",
        location: "Hyderabad, Telangana",
        jobType: "Full-time",
        experienceLevel: 4,
        position: 2
    },
    {
        title: "Full Stack Developer - MERN",
        description: "Build end-to-end web applications using MERN stack in Bangalore. Work on exciting fintech projects.",
        requirements: ["MongoDB", "Express", "React", "Node.js", "JavaScript", "AWS"],
        salary: "800000-1600000",
        location: "Bangalore, Karnataka",
        jobType: "Full-time",
        experienceLevel: 3,
        position: 2
    },
    {
        title: "Frontend Developer - React",
        description: "Create responsive and interactive user interfaces using React.js in Mumbai. Work with design teams to implement pixel-perfect UIs.",
        requirements: ["React", "Redux", "JavaScript", "CSS3", "SASS", "Material-UI"],
        salary: "700000-1300000",
        location: "Mumbai, Maharashtra",
        jobType: "Full-time",
        experienceLevel: 2,
        position: 3
    },
    {
        title: "Backend Developer - Python",
        description: "Develop scalable backend services using Python and Django in Pune. Work on data-intensive applications.",
        requirements: ["Python", "Django", "PostgreSQL", "Redis", "Celery", "Docker"],
        salary: "900000-1700000",
        location: "Pune, Maharashtra",
        jobType: "Full-time",
        experienceLevel: 3,
        position: 2
    },
    {
        title: "Full Stack Developer - Angular",
        description: "Build enterprise applications using Angular and .NET in Delhi NCR. Work on large-scale projects for government clients.",
        requirements: ["Angular", "TypeScript", "C#", ".NET Core", "SQL Server", "Azure"],
        salary: "1100000-2000000",
        location: "Gurgaon, Delhi NCR",
        jobType: "Full-time",
        experienceLevel: 4,
        position: 1
    },
    {
        title: "Senior Backend Developer",
        description: "Lead backend architecture decisions in Hyderabad. Design and implement high-performance distributed systems.",
        requirements: ["Java", "Spring Boot", "Microservices", "Kubernetes", "AWS", "MongoDB"],
        salary: "1500000-2500000",
        location: "Hyderabad, Telangana",
        jobType: "Full-time",
        experienceLevel: 6,
        position: 1
    },
    {
        title: "Frontend Developer - Vue.js",
        description: "Work with Vue.js framework to build modern web applications in Bangalore. Collaborate with UX/UI designers.",
        requirements: ["Vue.js", "JavaScript", "HTML5", "CSS3", "Vuex", "Nuxt.js"],
        salary: "650000-1200000",
        location: "Bangalore, Karnataka",
        jobType: "Full-time",
        experienceLevel: 2,
        position: 2
    },
    {
        title: "Full Stack Developer - Django",
        description: "Build web applications using Django and React in Mumbai. Work on e-commerce and fintech projects.",
        requirements: ["Python", "Django", "React", "PostgreSQL", "Redis", "JavaScript"],
        salary: "850000-1600000",
        location: "Mumbai, Maharashtra",
        jobType: "Full-time",
        experienceLevel: 3,
        position: 2
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Company.deleteMany({});
        await Job.deleteMany({});
        console.log('Cleared existing data');

        // Create users with hashed passwords
        const usersWithHashedPasswords = await Promise.all(
            sampleUsers.map(async (user) => ({
                ...user,
                password: await bcryptjs.hash(user.password, 10)
            }))
        );

        const createdUsers = await User.insertMany(usersWithHashedPasswords);
        console.log(`Created ${createdUsers.length} users`);

        // Create companies with userId references
        const companiesWithUsers = sampleCompanies.map((company, index) => ({
            ...company,
            userId: createdUsers[index]._id
        }));

        const createdCompanies = await Company.insertMany(companiesWithUsers);
        console.log(`Created ${createdCompanies.length} companies`);

        // Create jobs with company references
        const jobsWithCompanies = sampleJobs.map((job, index) => ({
            ...job,
            company: createdCompanies[index % createdCompanies.length]._id,
            created_by: createdUsers[index % createdUsers.length]._id
        }));

        const createdJobs = await Job.insertMany(jobsWithCompanies);
        console.log(`Created ${createdJobs.length} jobs`);

        console.log('✅ Database seeded successfully!');
        console.log('Sample login credentials:');
        console.log('Email: john@techcorp.com | Password: password123');
        console.log('Email: sarah@innovatenow.com | Password: password123');
        console.log('Email: mike@datadrive.com | Password: password123');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seeding function
seedDatabase();

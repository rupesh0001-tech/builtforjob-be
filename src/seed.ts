import prisma from './config/db.config';
import bcrypt from 'bcryptjs';

const FIRST_NAMES = [
  "Aarav", "Vihaan", "Arjun", "Sai", "Aditya", "Krishna", "Rohit", "Rahul", "Dev", "Rohan",
  "Ishaan", "Ananya", "Diya", "Pooja", "Neha", "Priya", "Sneha", "Shruti", "Riya", "Kavya",
  "Amit", "Suresh", "Ramesh", "Manish", "Sanjay", "Anil", "Sunil", "Rajesh", "Harish", "Deepak",
  "Vikram", "Manoj", "Sandeep", "Gaurav", "Nitin", "Alok", "Ashish", "Vinay", "Pawan", "Kunal",
  "Sameer", "Ajay", "Vijay", "Anand", "Vivek", "Abhay", "Akash", "Siddharth", "Varun", "Meera",
  "Swati", "Preeti", "Aarti", "Anjali", "Ritu", "Sapna", "Kiran", "Simran", "Sonali", "Mansi",
  "Dhruv", "Kabir", "Shaurya", "Tushar", "Aayush", "Pranav", "Rajat", "Yash", "Karan", "Tanmay",
  "Mehak", "Bhavya", "Divya", "Komal", "Sweta", "Priyanka", "Nisha", "Swathi", "Rupesh", "Kajal"
];

const LAST_NAMES = [
  "Sharma", "Patel", "Verma", "Gupta", "Iyer", "Nair", "Reddy", "Rao", "Jagtap", "Joshi",
  "Kulkarni", "Deshmukh", "Patil", "Sen", "Chatterjee", "Banerjee", "Mukherjee", "Das", "Roy", "Bose",
  "Mishra", "Saini", "Yadav", "Prasad", "Kumar", "Singh", "Mehta", "Trivedi", "Vyas", "Shah",
  "Bhat", "Hegde", "Shenoy", "Prabhu", "Kamath", "Pai", "Bhatia", "Kapoor", "Malhotra", "Khanna",
  "Mehra", "Chawla", "Gill", "Sandhu", "Grewal", "Sidhu", "Sodhi", "Bakshi", "Sethi", "Kohli"
];

const CITIES = [
  "Pune, Maharashtra", "Mumbai, Maharashtra", "Bengaluru, Karnataka", 
  "Hyderabad, Telangana", "Chennai, Tamil Nadu", "Delhi NCR", 
  "Noida, Uttar Pradesh", "Gurgaon, Haryana", "Kolkata, West Bengal",
  "Ahmedabad, Gujarat"
];

const JOB_TITLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", 
  "Full-Stack Developer", "DevOps Engineer", "Data Engineer", 
  "Mobile App Developer", "Cloud Solutions Architect", "QA Automation Engineer"
];

const SKILL_POOLS = [
  ["React", "TypeScript", "Tailwind CSS", "Next.js", "Redux"],
  ["Node.js", "Express", "PostgreSQL", "MongoDB", "Redis"],
  ["Python", "Django", "FastAPI", "PostgreSQL", "Docker"],
  ["Java", "Spring Boot", "MySQL", "Hibernate", "AWS"],
  ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"],
  ["React Native", "Swift", "Kotlin", "Firebase", "TypeScript"],
  ["Go", "Docker", "Kubernetes", "PostgreSQL", "gRPC"],
  ["Angular", "TypeScript", "Node.js", "Sass", "RxJS"]
];

const COLLEGES = [
  "Pune Institute of Computer Technology",
  "Indian Institute of Technology, Bombay",
  "Birla Institute of Technology and Science, Pilani",
  "Delhi Technological University",
  "Vellore Institute of Technology",
  "RV College of Engineering, Bengaluru",
  "College of Engineering, Pune (COEP)",
  "IIIT Hyderabad"
];

const COMPANIES = [
  "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", 
  "Tech Mahindra", "Capgemini", "Google India", "Microsoft India", 
  "Amazon Development Centre"
];

const TEMPLATE_IDS = [
  "sleek-dark",
  "creative-green",
  "retro-terminal",
  "glass-creative",
  "architect-prismatic",
  "engineering-sleek"
];

const MOCK_MESSAGES = [
  "Great portfolio! Are you open to remote freelance contracts?",
  "I am interested in hiring you for a full-time Full-Stack Engineer role. Let's connect.",
  "Your case studies look amazing. We have an opening at our company that matches your background.",
  "Hello, loved your projects. Can we discuss a potential collaborations on an AI project?",
  "Hi, I saw your GitHub profile. Incredible metrics! Are you looking for new opportunities?"
];

const PROJECT_IMAGE_IDS = [
  "photo-1555066931-4365d14bab8c",
  "photo-1542831371-29b0f74f9713",
  "photo-1517694712202-14dd9538aa97",
  "photo-1581291518655-9523c932bfcf",
  "photo-1504639725590-34d0984388bd",
  "photo-1526374965328-7f61d4dc18c5",
  "photo-1550751827-4bd374c3f58b",
  "photo-1498050108023-c5249f4df085",
  "photo-1461749280684-dccba630e2f6",
  "photo-1488590528505-98d2b5aba04b",
  "photo-1531403009284-440f080d1e12",
  "photo-1551288049-bebda4e38f71",
  "photo-1531297484001-80022131f5a1",
  "photo-1518770660439-4636190af475",
  "photo-1508921912186-1d1a45ebb3c1"
];

async function seed() {
  console.log("Starting database seeding process...");
  
  const deleted = await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: "@buildforjob.in"
      }
    }
  });
  console.log(`Cleaned up ${deleted.count} existing seeded user accounts.`);

  const hashedPassword = await bcrypt.hash("Test@123", 10);
  console.log("Hashed default password 'Test@123'.");

  for (let i = 0; i < 100; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length] as string;
    const lastName = LAST_NAMES[(i + 3) % LAST_NAMES.length] as string;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@buildforjob.in`;
    const phone = `+91 ${9800000000 + i}`;
    const city = CITIES[i % CITIES.length] as string;
    const jobTitle = JOB_TITLES[i % JOB_TITLES.length] as string;
    const skills = SKILL_POOLS[i % SKILL_POOLS.length] as string[];
    const college = COLLEGES[i % COLLEGES.length] as string;
    const company = COMPANIES[i % COMPANIES.length] as string;
    const templateId = TEMPLATE_IDS[i % TEMPLATE_IDS.length] as string;

    const imgId1 = PROJECT_IMAGE_IDS[(i * 2) % PROJECT_IMAGE_IDS.length] as string;
    const imgId2 = PROJECT_IMAGE_IDS[(i * 2 + 1) % PROJECT_IMAGE_IDS.length] as string;
    
    const imgUrl1 = `https://images.unsplash.com/${imgId1}?w=600&auto=format&fit=crop`;
    const imgUrl2 = `https://images.unsplash.com/${imgId2}?w=600&auto=format&fit=crop`;

    const bio = `Result-oriented ${jobTitle} with 3+ years of experience specializing in building highly scalable applications at ${company}. Graduated from ${college}.`;

    // Portfolio data snapshots
    const portfolioData: any = {
      personalInfo: {
        fullName: `${firstName} ${lastName}`,
        jobTitle,
        tagline: `Hi, I'm ${firstName}. I build high-performance scalable systems.`,
        bio,
        email,
        phone,
        location: city,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${firstName}`,
        isOpenToWork: true,
        socialLinks: {
          github: `https://github.com/${firstName.toLowerCase()}`,
          linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}`
        }
      },
      projects: [
        {
          id: `proj-1-${i}`,
          name: "E-Commerce Microservices",
          description: "High-availability retail microservice architecture serving 50k active requests.",
          techStack: [skills[0] || "React", skills[1] || "TypeScript", "Docker", "Kubernetes"],
          features: ["Real-time inventory tracking", "Stripe payment orchestration", "Autoscaling failovers"],
          liveUrl: "https://example.com",
          githubUrl: "https://github.com",
          imageUrl: imgUrl1
        },
        {
          id: `proj-2-${i}`,
          name: "AI Analytics Pipeline",
          description: "Distributed analytics pipeline processing clickstream data with machine learning.",
          techStack: ["Python", "FastAPI", "TensorFlow", "Apache Kafka"],
          features: ["Real-time fraud triggers", "D3 visualization dashboards", "Hourly model re-training"],
          liveUrl: "https://example.com",
          githubUrl: "https://github.com",
          imageUrl: imgUrl2
        }
      ]
    };

    const portfolioSettings: any = {
      theme: "dark",
      accentColor: "#001BB7",
      fontFamily: "Plus Jakarta Sans"
    };

    // Submissions - 8 items so they span 2 pages (limit is 5) to test pagination
    const responseData = [
      {
        name: (FIRST_NAMES[(i + 1) % FIRST_NAMES.length] as string) + " " + (LAST_NAMES[(i + 2) % LAST_NAMES.length] as string),
        email: `hiring.team${i}@google.com`,
        message: "Your microservice optimization work is highly relevant to our cloud infra team. Let's schedule an interview.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        name: (FIRST_NAMES[(i + 3) % FIRST_NAMES.length] as string) + " " + (LAST_NAMES[(i + 4) % LAST_NAMES.length] as string),
        email: `hr.tech${i}@netflix.com`,
        message: "Stunning portfolio aesthetics! Are you available to connect regarding a Senior Developer role next week?",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6 // 6 hours ago
        )
      },
      {
        name: (FIRST_NAMES[(i + 5) % FIRST_NAMES.length] as string) + " " + (LAST_NAMES[(i + 6) % LAST_NAMES.length] as string),
        email: `lead.architect${i}@microsoft.com`,
        message: "Your distributed pipeline system design has impressive reliability logs. Do you have security clearance?",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
      },
      {
        name: (FIRST_NAMES[(i + 7) % FIRST_NAMES.length] as string) + " " + (LAST_NAMES[(i + 8) % LAST_NAMES.length] as string),
        email: `founder${i}@startup.io`,
        message: "Love the clean design principles here. We're raising a seed round and need a foundational engineer. Let's grab coffee.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        name: (FIRST_NAMES[(i + 9) % FIRST_NAMES.length] as string) + " " + (LAST_NAMES[(i + 10) % LAST_NAMES.length] as string),
        email: `coordinator${i}@meta.com`,
        message: "Very clean layouts and code quality metrics. Let's set up a technical screening call soon.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36) // 1.5 days ago
      },
      {
        name: (FIRST_NAMES[(i + 11) % FIRST_NAMES.length] as string) + " " + (LAST_NAMES[(i + 12) % LAST_NAMES.length] as string),
        email: `pm.systems${i}@amazon.com`,
        message: "Your stripe orchestration feature set is highly scalable. Let's discuss open positions on our payments team.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 days ago
      },
      {
        name: (FIRST_NAMES[(i + 13) % FIRST_NAMES.length] as string) + " " + (LAST_NAMES[(i + 14) % LAST_NAMES.length] as string),
        email: `talent${i}@uber.com`,
        message: "Impressive live portfolio site and clean layout. Let's set up a time to chat.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72) // 3 days ago
      },
      {
        name: (FIRST_NAMES[(i + 15) % FIRST_NAMES.length] as string) + " " + (LAST_NAMES[(i + 16) % LAST_NAMES.length] as string),
        email: `engineering.lead${i}@apple.com`,
        message: "Excellent coding practices shown in your public repos. Get in touch if you're open to career changes.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96) // 4 days ago
      }
    ];

    // Resume snapshot
    const resumeContent: any = {
      personalInfo: {
        fullName: `${firstName} ${lastName}`,
        email,
        phone,
        location: city,
        jobTitle
      },
      skills: skills,
      experience: [
        {
          company,
          role: jobTitle,
          duration: "2023 - Present",
          description: `Worked as a ${jobTitle} delivering scalable microservices, leading team of 4 engineers, and increasing load capabilities by 45%.`
        }
      ],
      education: [
        {
          institution: college,
          degree: "Bachelor of Technology",
          field: "Computer Science",
          graduationDate: "2022"
        }
      ]
    };

    const coverLetterContent: any = {
      personalInfo: {
        fullName: `${firstName} ${lastName}`,
        email,
        phone
      },
      employerInfo: {
        companyName: "Tech Giants Pvt Ltd"
      },
      body: {
        intro: `I am writing to express my enthusiastic interest in the ${jobTitle} position.`,
        body1: `As a professional developer with experience at ${company}, I have mastered ${skills.join(", ")}.`,
        conclusion: "Thank you for considering my application. I look forward to hearing from you."
      }
    };

    try {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          bio,
          location: city,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${firstName}`,
          jobTitle,
          isVerified: true,
          profileSynced: true,
          plan: "FREE",
          tokens: 5.0,
          skills: {
            create: skills.map(name => ({ name }))
          },
          experience: {
            create: [
              {
                company,
                position: jobTitle,
                startDate: "2023",
                endDate: "Present",
                isCurrent: true,
                description: `Contributed to software engineering cycles as a ${jobTitle}.`
              }
            ]
          },
          education: {
            create: [
              {
                institution: college,
                degree: "Bachelor of Technology",
                field: "Computer Science",
                graduationDate: "2022",
                graduationType: "CGPA",
                gpa: "8.8"
              }
            ]
          },
          projects: {
            create: [
              {
                name: "Analytics Core Hub",
                techStack: skills.join(", "),
                description: "Distributed analytics system."
              }
            ]
          },
          resumes: {
            create: {
              title: `${firstName}_Resume`,
              company,
              template: "Modern",
              content: resumeContent,
              versions: {
                create: [
                  {
                    role: jobTitle,
                    company,
                    content: resumeContent
                  }
                ]
              }
            }
          },
          coverLetters: {
            create: {
              title: `${firstName}_Cover_Letter`,
              company: "Tech Giants Pvt Ltd",
              template: "Modern",
              content: coverLetterContent
            }
          },
          atsReports: {
            create: {
              resumeName: `${firstName}_Resume`,
              jobDescription: `Looking for a skilled ${jobTitle} experienced with ${skills[0] || "React"} and ${skills[1] || "TypeScript"}.`,
              score: 75 + (i % 15),
              details: "Good resume structure and robust experience match.",
              resumeWordCount: 380,
              jdWordCount: 220,
              suggestions: {}
            }
          },
          portfolio: {
            create: {
              templateId,
              data: portfolioData,
              settings: portfolioSettings,
              responses: {
                create: responseData
              }
            }
          }
        }
      });
      console.log(`[Seed] Created User ${i + 1}/100: ${firstName} ${lastName}`);
    } catch (err) {
      console.error(`[Seed] Error creating user ${i + 1}: ${email}`, err);
    }
  }

  console.log("Database seeding completed successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding crashed:", err);
  process.exit(1);
});

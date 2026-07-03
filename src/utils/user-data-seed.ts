import { PrismaClient } from '@prisma/client';

export async function seedUserSampleData(prisma: PrismaClient) {
  try {
    const targetEmail = 'rupeshff26@gmail.com';
    
    // Find target user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail }
    });

    if (!user) {
      console.log(`User ${targetEmail} not found. Skipping sample data seed.`);
      return;
    }

    const userId = user.id;

    // Ensure target user has PRO plan and 50 tokens
    if (user.plan !== 'PRO' || Number(user.tokens) < 50) {
      await prisma.user.update({
        where: { id: userId },
        data: { plan: 'PRO', tokens: 50.0 }
      });
      console.log(`Upgraded user ${targetEmail} to PRO with 50 tokens in seeder`);
    }

    // 1. Seed Sample Resumes if none exist
    const resumeCount = await prisma.resume.count({ where: { userId } });
    if (resumeCount === 0) {
      const resumeContent1 = {
        personalInfoData: {
          firstName: 'Rupesh',
          lastName: 'Jagtap',
          email: 'rupeshff26@gmail.com',
          phone: '+91 98765 43210',
          address: 'Mumbai, India',
          linkedin: 'https://linkedin.com/in/rupesh-jagtap',
          website: 'https://rupeshhh.in'
        },
        professionalSummaryData: 'Accomplished Software Engineer with 3+ years of experience designing and implementing scalable backend applications, payment pipelines, and React-based developer interfaces. Proficient in TypeScript, Node.js, Go, PostgreSQL, and AWS.',
        experienceData: [
          {
            position: 'Software Engineer',
            company: 'TechSolutions Ltd',
            startDate: '2024-01',
            endDate: '',
            is_current: true,
            description: 'Designed and implemented high-throughput REST APIs using Node.js and TypeScript.\nReduced database query latency by 35% through custom index tuning and query optimization.\nCollaborated with product teams to ship 15+ microservices under AWS.'
          },
          {
            position: 'Associate Developer',
            company: 'AppWorks Corp',
            startDate: '2022-06',
            endDate: '2023-12',
            is_current: false,
            description: 'Developed responsive React frontends using Next.js and Tailwind CSS.\nMaintained and optimized PostgreSQL database instances with Prisma ORM.\nImproved unit test coverage to 90% using Jest.'
          }
        ],
        educationData: [
          {
            institution: 'Mumbai University',
            degree: 'Bachelor of Science in Computer Science',
            graduation_date: '2022',
            field: 'Computer Science'
          }
        ],
        projectData: [
          {
            name: 'BuildForJob Platform',
            techStack: 'Next.js, Node.js, Prisma, PostgreSQL',
            description: 'An AI-powered resume and cover letter optimization builder.\nSupports real-time preview, template switching, and OAuth account linking.'
          }
        ],
        skillData: ['TypeScript', 'JavaScript', 'Node.js', 'Go', 'React', 'Next.js', 'PostgreSQL', 'Prisma', 'Docker', 'AWS'],
        template: 'Modern',
        accentColor: '#001BB7',
        sectionVisibility: {
          summary: true,
          workExperience: true,
          education: true,
          personalProjects: true,
          additional: true
        }
      };

      const resumeContent2 = {
        personalInfoData: {
          firstName: 'Rupesh',
          lastName: 'Jagtap',
          email: 'rupeshff26@gmail.com',
          phone: '+91 98765 43210',
          address: 'Mumbai, India',
          linkedin: 'https://linkedin.com/in/rupesh-jagtap',
          website: 'https://rupeshhh.in'
        },
        professionalSummaryData: 'Results-driven Backend Engineer specializing in cloud architecture, database scaling, and API design. Proven track record of optimizing performance and deploying stable Node.js/TypeScript microservices.',
        experienceData: [
          {
            position: 'Backend Developer',
            company: 'Stripe Integration Team',
            startDate: '2023-11',
            endDate: '',
            is_current: true,
            description: 'Maintained core database systems and scaled payment transaction handlers.\nCreated robust asynchronous message handlers using Apache Kafka.\nOptimized API gateway performance to process 5,000+ request/sec.'
          }
        ],
        educationData: [
          {
            institution: 'Mumbai University',
            degree: 'Bachelor of Science in Computer Science',
            graduation_date: '2022',
            field: 'Computer Science'
          }
        ],
        projectData: [
          {
            name: 'API Load Balancing Suite',
            techStack: 'Go, Nginx, Redis, AWS',
            description: 'Built a customized weight-based load balancer for microservice API clusters.\nReduced system recovery times under network failure scenarios by 60%.'
          }
        ],
        skillData: ['Node.js', 'Go', 'TypeScript', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'Kubernetes', 'AWS'],
        template: 'Minimal',
        accentColor: '#4f46e5',
        sectionVisibility: {
          summary: true,
          workExperience: true,
          education: true,
          personalProjects: true,
          additional: true
        }
      };

      await prisma.resume.createMany({
        data: [
          {
            userId,
            title: 'Fullstack Software Engineer Resume',
            company: 'General',
            template: 'Modern',
            content: resumeContent1,
            isMagic: true,
            isDraft: false
          },
          {
            userId,
            title: 'Backend Systems Developer Resume',
            company: 'Stripe',
            template: 'Minimal',
            content: resumeContent2,
            isMagic: true,
            isDraft: false
          }
        ]
      });

      console.log('Sample resumes seeded successfully!');
    }

    // 2. Seed Sample Cover Letters if none exist
    const clCount = await prisma.coverLetter.count({ where: { userId } });
    if (clCount === 0) {
      const coverLetterContent1 = {
        personalInfo: {
          firstName: 'Rupesh',
          lastName: 'Jagtap',
          email: 'rupeshff26@gmail.com',
          phone: '+91 98765 43210',
          address: 'Mumbai, India',
          linkedin: 'https://linkedin.com/in/rupesh-jagtap',
          website: 'https://rupeshhh.in'
        },
        employerInfo: {
          companyName: 'Google',
          address: 'Bangalore, India',
          recipientName: 'Hiring Manager'
        },
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        salutation: 'Dear Hiring Manager,',
        mode: 'structured',
        body: {
          intro: 'I am writing to express my strong interest in the Software Engineer position at Google.',
          body1: 'With over three years of hands-on experience designing distributed architectures, scalable payment integrations, and high-performance React systems, I am excited about Google’s engineering excellence.',
          body2: 'In my current role at TechSolutions, I successfully decreased database query latencies by 35% and collaborated on shipping critical microservices. I have a strong foundation in data structures and algorithm design.',
          body3: 'I admire Google’s user-centric engineering focus and believe my background in Go, TypeScript, and AWS makes me a strong fit for your team.',
          conclusion: 'Thank you for your time and consideration. I look forward to discussing how my experience matches your requirements.'
        },
        signOff: 'Sincerely,\nRupesh Jagtap'
      };

      const coverLetterContent2 = {
        personalInfo: {
          firstName: 'Rupesh',
          lastName: 'Jagtap',
          email: 'rupeshff26@gmail.com',
          phone: '+91 98765 43210',
          address: 'Mumbai, India',
          linkedin: 'https://linkedin.com/in/rupesh-jagtap',
          website: 'https://rupeshhh.in'
        },
        employerInfo: {
          companyName: 'Stripe',
          address: 'San Francisco, CA',
          recipientName: 'Developer Relations & Platform Hiring Team'
        },
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        salutation: 'Dear Platform Engineering Team,',
        mode: 'structured',
        body: {
          intro: 'I am thrilled to apply for the Backend Systems Engineer opening on the Stripe Platform Integration team.',
          body1: 'Your dedication to clean APIs and developers-first solutions perfectly matches my values. Over the past 3 years, I have worked primarily on scaling Postgres, Go systems, and AWS instances to handle payment transaction spikes.',
          body2: 'At AppWorks, I oversaw database migrations and API performance tuning. I also built a Redis-backed weight load balancer, optimizing high-traffic gateway endpoints.',
          body3: 'Integrating APIs with Stripe is a core skill of mine, and I would love to contribute to maintaining your industry-standard payment pipelines.',
          conclusion: 'I look forward to discussing how my background in high-availability backend systems can add value to Stripe.'
        },
        signOff: 'Sincerely,\nRupesh Jagtap'
      };

      await prisma.coverLetter.createMany({
        data: [
          {
            userId,
            title: 'Google Software Engineer Application Letter',
            company: 'Google',
            recipient: 'Hiring Manager',
            template: 'Modern',
            content: coverLetterContent1,
            isDraft: false,
            isMagic: true
          },
          {
            userId,
            title: 'Stripe Platform Backend Developer Letter',
            company: 'Stripe',
            recipient: 'Platform Team',
            template: 'Minimal',
            content: coverLetterContent2,
            isDraft: false,
            isMagic: true
          }
        ]
      });

      console.log('Sample cover letters seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding user sample data:', error);
  }
}

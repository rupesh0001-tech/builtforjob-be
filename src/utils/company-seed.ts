import { PrismaClient } from '@prisma/client';

export async function seedCompanyProfiles(prisma: PrismaClient) {
  try {
    const count = await prisma.companyProfile.count();
    if (count > 0) {
      console.log('Company profiles already seeded.');
      return;
    }

    const companyProfiles = [
      // Big Tech
      {
        name: 'Google',
        industry: 'Big Tech',
        hiringStyle: 'Engineering-heavy, algorithms-focused, structured behavioral (Googlyness) interviews.',
        preferredSkills: ['Data Structures', 'Algorithms', 'System Design', 'Distributed Systems', 'Scalability'],
        technologiesUsed: ['Java', 'C++', 'Python', 'Go', 'Kubernetes', 'TensorFlow'],
        engineeringCulture: 'Highly collaborative, peer-review intensive, strong emphasis on code scale and performance.',
        atsKeywords: ['algorithms', 'system design', 'distributed systems', 'scalability', 'data structures'],
        commonInterviewFocus: 'Coding (leetcode style), System Design, Googleyness & Leadership.',
        resumeOptimizationKeys: ['large-scale systems', 'performance optimization', 'concurrency', 'algorithms'],
        coverLetterTone: 'Professional, innovative, intellectually humble, and collaborative.'
      },
      {
        name: 'Microsoft',
        industry: 'Big Tech',
        hiringStyle: 'Problem-solving, algorithmic efficiency, system architectural design.',
        preferredSkills: ['C#', 'Cloud Computing', 'System Architecture', 'Software Engineering Core'],
        technologiesUsed: ['.NET', 'TypeScript', 'C++', 'Azure', 'SQL Server'],
        engineeringCulture: 'Large-scale product engineering, customer empathy, stable and backward-compatible solutions.',
        atsKeywords: ['cloud engineering', 'azure', 'software architecture', 'object-oriented programming'],
        commonInterviewFocus: 'Data structures, coding efficiency, cloud architectural patterns.',
        resumeOptimizationKeys: ['microservices', 'cloud migration', 'software engineering lifecycle', 'scalability'],
        coverLetterTone: 'Professional, enterprise-focused, structured, and driven.'
      },
      {
        name: 'Amazon',
        industry: 'Big Tech',
        hiringStyle: 'Behavioral-heavy centered around Leadership Principles, system scaling under load.',
        preferredSkills: ['System Design', 'AWS Services', 'Distributed Architecture', 'Full Stack Development'],
        technologiesUsed: ['Java', 'C++', 'Python', 'AWS', 'DynamoDB', 'EC2'],
        engineeringCulture: 'Ownership, bias for action, write detailed technical design docs, deep dive on metrics.',
        atsKeywords: ['cloud scaling', 'leadership principles', 'aws', 'distributed databases', 'reliability'],
        commonInterviewFocus: 'Leadership Principles (LP), System Design, Algorithmic Coding.',
        resumeOptimizationKeys: ['customer-facing services', 'scalability', 'operational excellence', 'ownership'],
        coverLetterTone: 'Action-oriented, metrics-driven, customer-centric, and outcome-focused.'
      },
      {
        name: 'Apple',
        industry: 'Big Tech',
        hiringStyle: 'Deep domain expertise, highly specific technical grilling, focus on hardware-software integration.',
        preferredSkills: ['Embedded Systems', 'System Optimization', 'Swift', 'Objective-C', 'Security'],
        technologiesUsed: ['C', 'C++', 'Objective-C', 'Swift', 'Python'],
        engineeringCulture: 'Secrecy, extreme detail orientation, visual perfection, cross-functional collaboration.',
        atsKeywords: ['system programming', 'embedded software', 'ui perfection', 'memory management'],
        commonInterviewFocus: 'Low-level coding, architectural details, domain experience.',
        resumeOptimizationKeys: ['hardware integration', 'memory optimization', 'performance tuning', 'confidentiality'],
        coverLetterTone: 'Creative, detail-oriented, design-focused, and highly technical.'
      },
      {
        name: 'Meta',
        industry: 'Big Tech',
        hiringStyle: 'Fast-paced algorithmic interviews, system design scaling to billions of users.',
        preferredSkills: ['Product Engineering', 'React', 'Mobile Development', 'Distributed Systems'],
        technologiesUsed: ['Hack/PHP', 'JavaScript', 'C++', 'Python', 'React', 'PyTorch'],
        engineeringCulture: 'Move fast, impact-oriented, focus on data analysis and product deployment speed.',
        atsKeywords: ['react', 'product infrastructure', 'high-throughput systems', 'data scale'],
        commonInterviewFocus: 'Coding speed and accuracy, Product Architecture, Behavioral.',
        resumeOptimizationKeys: ['product impact', 'rapid deployment', 'scale improvements', 'performance enhancement'],
        coverLetterTone: 'Innovative, fast-paced, highly collaborative, and developer-centric.'
      },
      {
        name: 'Netflix',
        industry: 'Big Tech',
        hiringStyle: 'Senior-only expectations, high performance alignment, technical and cultural values fit.',
        preferredSkills: ['Chaos Engineering', 'Video Streaming Infrastructure', 'Cloud Architecture', 'Distributed Systems'],
        technologiesUsed: ['Java', 'JavaScript', 'Node.js', 'AWS', 'Cassandra'],
        engineeringCulture: 'Freedom and responsibility, keeper test alignment, context not control, high compensation.',
        atsKeywords: ['chaos engineering', 'cloud infrastructure', 'video rendering', 'system resilience'],
        commonInterviewFocus: 'Culture fit, system resilience design, architectural deep-dive.',
        resumeOptimizationKeys: ['system resilience', 'high availability', 'chaos testing', 'freedom and responsibility'],
        coverLetterTone: 'Direct, honest, highly mature, and impact-aligned.'
      },
      {
        name: 'Adobe',
        industry: 'Big Tech',
        hiringStyle: 'Core computer science concepts, object-oriented design, graphics/performance engineering.',
        preferredSkills: ['Object-Oriented Design', 'Desktop/Cloud Architectures', 'C++', 'Java'],
        technologiesUsed: ['C++', 'Java', 'JavaScript', 'TypeScript', 'AWS'],
        engineeringCulture: 'Quality-oriented, creative solutions, robust software design, stable release workflows.',
        atsKeywords: ['object-oriented design', 'c++', 'creative software', 'cloud services'],
        commonInterviewFocus: 'Core CS algorithms, system designs, OOP patterns.',
        resumeOptimizationKeys: ['reusable code libraries', 'cross-platform tools', 'software design patterns'],
        coverLetterTone: 'Creative, professional, quality-focused, and collaborative.'
      },
      {
        name: 'Atlassian',
        industry: 'Big Tech',
        hiringStyle: 'Values-aligned, practical coding exercises, system design, team-collaboration scenarios.',
        preferredSkills: ['Full Stack Development', 'React', 'Java', 'APIs', 'Cloud Engineering'],
        technologiesUsed: ['React', 'TypeScript', 'Java', 'AWS', 'PostgreSQL'],
        engineeringCulture: 'Open communication, team first, high code review standards, agile development.',
        atsKeywords: ['collaboration tools', 'react developer', 'agile frameworks', 'cloud scaling'],
        commonInterviewFocus: 'Practical programming tasks, system design, values interview (e.g. Play, as a Team).',
        resumeOptimizationKeys: ['team productivity', 'api design', 'scalable react components', 'agile processes'],
        coverLetterTone: 'Open, collaborative, team-oriented, and customer-empathetic.'
      },

      // FinTech
      {
        name: 'Stripe',
        industry: 'FinTech',
        hiringStyle: 'Hands-on practical challenges: API design, debugging, system integrations.',
        preferredSkills: ['API Design', 'Security', 'Distributed Systems', 'Payment Architecture', 'Robustness'],
        technologiesUsed: ['Ruby', 'Go', 'Java', 'Scala', 'AWS', 'Kafka'],
        engineeringCulture: 'Focuses on developer experience, high-quality documentation, polished code, and correctness.',
        atsKeywords: ['api integrations', 'payment gateways', 'transaction security', 'robust code', 'distributed logging'],
        commonInterviewFocus: 'Practical programming (integration tasks, bug fixing), System Design, and Stripe values.',
        resumeOptimizationKeys: ['developer tools', 'transaction consistency', 'payment infrastructure', 'security protocols'],
        coverLetterTone: 'Detail-oriented, execution-focused, developer-centric, and elegant.'
      },
      {
        name: 'Razorpay',
        industry: 'FinTech',
        hiringStyle: 'Highly practical code execution, database transaction integrity, system performance.',
        preferredSkills: ['Node.js', 'Go', 'Database Management', 'Scalability', 'Fintech Core'],
        technologiesUsed: ['PHP', 'Go', 'Node.js', 'React', 'AWS', 'MySQL'],
        engineeringCulture: 'Fast iteration, developer autonomy, ownership, scaling payment pipelines.',
        atsKeywords: ['payment integration', 'database reliability', 'fintech protocols', 'scalable backend'],
        commonInterviewFocus: 'System architectural design, multi-tenant databases, transaction management.',
        resumeOptimizationKeys: ['transaction success rate', 'payment pipelines', 'microservices architecture', 'scalability'],
        coverLetterTone: 'Innovative, execution-driven, customer-focused, and tech-forward.'
      },
      {
        name: 'Coinbase',
        industry: 'FinTech',
        hiringStyle: 'Security-first software design, algorithmic reliability, blockchain protocols.',
        preferredSkills: ['Blockchain Technology', 'Security Protocols', 'Distributed Ledger', 'Go', 'Solidity'],
        technologiesUsed: ['Go', 'Ruby', 'Node.js', 'React', 'Solidity', 'AWS'],
        engineeringCulture: 'Security-oriented, remote-first, high autonomy, metrics-driven software planning.',
        atsKeywords: ['smart contracts', 'blockchain ledger', 'cryptographic security', 'distributed systems'],
        commonInterviewFocus: 'Algorithmic efficiency, security verification, blockchain design concepts.',
        resumeOptimizationKeys: ['cryptographic integration', 'high-security infrastructure', 'resilient api endpoints'],
        coverLetterTone: 'Professional, safety-focused, innovative, and mission-driven.'
      },

      // SaaS
      {
        name: 'Notion',
        industry: 'SaaS',
        hiringStyle: 'Product and craft-focused, clean visual implementation, database performance optimization.',
        preferredSkills: ['Frontend Engineering', 'React', 'Node.js', 'SQL Optimization', 'UI/UX Craftsmanship'],
        technologiesUsed: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        engineeringCulture: 'Craft-oriented, high standard of visual and technical design, product-driven teams.',
        atsKeywords: ['react architecture', 'db optimization', 'ui polish', 'user experience design'],
        commonInterviewFocus: 'Practical product design, frontend scaling, database schema design.',
        resumeOptimizationKeys: ['visual optimization', 'database index tuning', 'user interface modularity'],
        coverLetterTone: 'Craftsmanship-focused, creative, detail-oriented, and thoughtful.'
      },
      {
        name: 'Linear',
        industry: 'SaaS',
        hiringStyle: 'Extremely focused on speed, efficiency, and engineering craft. Minimal process, high autonomy.',
        preferredSkills: ['TypeScript', 'React', 'Electron', 'Real-time Synchronization', 'Web Performance'],
        technologiesUsed: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
        engineeringCulture: 'Remote-first, high agency, extreme focus on details, speed, and sleek product styling.',
        atsKeywords: ['web performance', 'real-time sync', 'typescript', 'graphQL', 'offline support'],
        commonInterviewFocus: 'Frontend performance, real-time sync systems, code quality and craft.',
        resumeOptimizationKeys: ['web performance optimization', 'latency reduction', 'real-time architectures'],
        coverLetterTone: 'Minimalist, craft-obsessed, execution-focused, and highly technical.'
      },
      {
        name: 'Vercel',
        industry: 'SaaS',
        hiringStyle: 'Open-source contributions, developer-focused tooling design, high-performance edge architectures.',
        preferredSkills: ['Next.js', 'Node.js', 'Edge Networking', 'Frontend Architecture', 'Rust'],
        technologiesUsed: ['TypeScript', 'Next.js', 'Rust', 'Go', 'AWS'],
        engineeringCulture: 'Developer-obsessed, high-performance styling, open-source first, rapid deployments.',
        atsKeywords: ['next.js developer', 'edge functions', 'frontend optimization', 'open source developer'],
        commonInterviewFocus: 'Next.js rendering strategies, Edge network layouts, practical web development.',
        resumeOptimizationKeys: ['frontend infrastructure', 'edge caching optimization', 'serverless performance'],
        coverLetterTone: 'Developer-centric, high-performance, open-source enthusiastic, and innovative.'
      },
      {
        name: 'Supabase',
        industry: 'SaaS',
        hiringStyle: 'Open-source database structures, Postgres performance, open integration tools.',
        preferredSkills: ['PostgreSQL', 'Go', 'TypeScript', 'Realtime Systems', 'Database Internals'],
        technologiesUsed: ['PostgreSQL', 'Go', 'TypeScript', 'Elixir', 'Docker'],
        engineeringCulture: 'Open-source development, database scalability, simple integration interfaces, community support.',
        atsKeywords: ['postgres expert', 'realtime databases', 'serverless apis', 'database performance'],
        commonInterviewFocus: 'Database optimization, realtime sync APIs, open-source development.',
        resumeOptimizationKeys: ['database scaling', 'realtime web applications', 'open-source engineering'],
        coverLetterTone: 'Developer-oriented, community-centric, database-passionate, and transparent.'
      },

      // Startups
      {
        name: 'Scale AI',
        industry: 'Startups',
        hiringStyle: 'Fast-paced execution, AI model training pipeline scaling, high-performance data processing.',
        preferredSkills: ['Machine Learning', 'Data Pipelines', 'Python', 'Scalable Backends', 'AI Infrastructure'],
        technologiesUsed: ['Python', 'TypeScript', 'React', 'MongoDB', 'AWS', 'PyTorch'],
        engineeringCulture: 'High execution speed, bias for action, heavy data and AI metrics alignment, intense environment.',
        atsKeywords: ['data pipelines', 'machine learning infrastructure', 'ai platforms', 'high throughput systems'],
        commonInterviewFocus: 'Algorithmic problems, machine learning pipelines, system design for high-volume data.',
        resumeOptimizationKeys: ['data pipeline scalability', 'ml model throughput', 'rapid system scaling'],
        coverLetterTone: 'Ambitious, fast-paced, highly execution-driven, and AI-forward.'
      },
      {
        name: 'Perplexity',
        industry: 'Startups',
        hiringStyle: 'AI search algorithms, real-time data retrieval, high performance frontend integration.',
        preferredSkills: ['AI Search', 'Natural Language Processing', 'TypeScript', 'LLM Integrations', 'Backend Speed'],
        technologiesUsed: ['Python', 'TypeScript', 'React', 'Node.js', 'PyTorch', 'AWS'],
        engineeringCulture: 'Extremely fast iteration, small highly capable team, focus on search speed and user accuracy.',
        atsKeywords: ['llm api integrations', 'natural language processing', 'high speed searches', 'typescript backend'],
        commonInterviewFocus: 'Search architectures, prompt design, high performance API logic.',
        resumeOptimizationKeys: ['llm deployment', 'latency reduction', 'real-time searches', 'conversational interfaces'],
        coverLetterTone: 'Innovative, hyper-focused on efficiency, AI-passionate, and fast-paced.'
      }
    ];

    await prisma.companyProfile.createMany({
      data: companyProfiles
    });

    console.log('Company profiles seeded successfully!');
  } catch (error) {
    console.error('Error seeding company profiles:', error);
  }
}

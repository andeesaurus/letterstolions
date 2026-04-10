export const siteConfig = {
  name: "Letters to Lions",
  tagline: "From students who have been there",
  description:
    "A place where Columbia students and alumni write letters to incoming freshmen — for the first weeks, the hard days, and everything in between.",
};

export const heroContent = {
  headline: "You're not alone in this.",
  subheadline:
    "Letters from Columbia students and alumni to incoming freshmen — for the first weeks, the hard days, and everything in between.",
  ctaRead: "Read a Letter",
};

export const aboutContent = {
  title: "About Letters to Lions",
  intro: `Letters to Lions is a platform for the Columbia University community to share honest, supportive letters with incoming freshmen. It exists because starting college is one of the most exciting and disorienting experiences a person can go through — and sometimes the most helpful thing is hearing from someone who's been there.`,
  sections: [
    {
      title: "What this is",
      body: "This is a collection of real letters written by real Columbia students, alumni, and community members. They cover everything from homesickness and academic pressure to finding friends and discovering the city. Every letter is reviewed before it's published to ensure it meets our community standards. If you'd like to submit a letter, please forward it to asl2216@columbia.edu.",
    },
    {
      title: "Who it's for",
      body: "Primarily, these letters are for incoming Columbia freshmen — students who are about to begin or have just begun their time at the university. But anyone in the Columbia community is welcome to read them.",
    },
    {
      title: "Why it exists",
      body: "Because the transition to college is hard, and it helps to know you're not the first person to feel lost, overwhelmed, or unsure. While these letters don't replace professional support, they offer peer support and mutual care.",
    },
    {
      title: "Community values",
      body: "Kindness. Honesty. Respect. Letters should be encouraging without being prescriptive, honest without being harmful, and personal without violating anyone's privacy.",
    },
    {
      title: "Privacy",
      body: "Display names are optional — authors can use a pseudonym or remain anonymous. We do not track individual reading behavior or share any data with third parties.",
    },
  ],
  disclaimer:
    "Letters to Lions is a peer support platform, not a crisis service. If you are experiencing a mental health emergency, please contact Columbia Counseling and Psychological Services at (212) 854-2878 or call 988 (Suicide & Crisis Lifeline). If you are in immediate danger, call 911 or Columbia Public Safety at (212) 854-5555.",
};

export const resourcesConfig = {
  intro:
    "Starting at Columbia means navigating a new city, a rigorous academic environment, and a lot of change. These resources are here to support you through all of it.",
  sections: [
    {
      title: "On-Campus Support",
      description: "Columbia services available to all students.",
      urgent: false,
      resources: [
        { name: "Counseling and Psychological Services (CPS)", description: "Free, confidential mental health support for Columbia students.", url: "https://www.health.columbia.edu/content/individual-counseling", phone: "(212) 854-2878" },
        { name: "Columbia Health", description: "Primary care, wellness programs, immunizations, and health education.", url: "https://health.columbia.edu", phone: "(212) 854-2284" },
        { name: "Disability Services", description: "Accommodations and support for students with documented disabilities.", url: "https://health.columbia.edu/content/disability-services" },
      ],
    },
    {
      title: "Academic Support",
      description: "Help with coursework, writing, advising, and academic skills.",
      urgent: false,
      resources: [
        { name: "Columbia Writing Center", description: "Free one-on-one writing consultations for any assignment.", url: "https://www.college.columbia.edu/core-curriculum/undergraduate-writing-program/writing-center" },
        { name: "Academic Resource Center", description: "Tutoring, study groups, academic coaching, and workshops.", url: "https://www.gs.columbia.edu/content/academic-resource-center" },
      ],
    },
    {
      title: "Community & Belonging",
      description: "Spaces and organizations that help you find your people.",
      urgent: false,
      resources: [
        { name: "Multicultural Affairs", description: "Cultural programming, identity-based support, and community building.", url: "https://studentaffairs.columbia.edu/multicultural-affairs" },
        { name: "International Students and Scholars Office (ISSO)", description: "Immigration advising, programming, and support for international students.", url: "https://isso.columbia.edu" },
        { name: "Columbia Chaplain's Office", description: "Interfaith programming and spiritual advising for all faiths and none.", url: "https://ouc.columbia.edu/" },
      ],
    },
    {
      title: "Crisis & Urgent Support",
      description: "If you or someone you know needs immediate help.",
      urgent: true,
      resources: [
        { name: "988 Suicide & Crisis Lifeline", description: "Call or text 988, available 24/7.", phone: "988", url: "https://988lifeline.org" },
        { name: "Columbia Same Day Care", description: "Drop-in services and same-day support.", phone: "(212) 854-2878", url: "https://www.health.columbia.edu/content/same-day-care" },
        { name: "Columbia Public Safety", description: "24/7 campus safety and emergency response.", phone: "(212) 854-5555", url: "https://publicsafety.columbia.edu" },
        { name: "Crisis Text Line", description: "Text HOME to 741741 for free, 24/7 crisis support.", phone: "Text HOME to 741741", url: "https://www.crisistextline.org" },
      ],
    },
  ],
};

export const supportDisclaimer =
  "Letters to Lions is a peer encouragement project — not a substitute for professional support. If you're going through something difficult, please reach out to Columbia Counseling and Psychological Services or another trusted resource.";

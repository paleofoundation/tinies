import type { Prisma, PrismaClient } from "@prisma/client";

type QuizOpt = { text: string; isCorrect: boolean };

type SlideIn = {
  slideNumber: number;
  title: string;
  content: string;
  slideType: "lesson" | "quiz";
  imageUrl?: string | null;
  quizQuestion?: string;
  quizOptions?: QuizOpt[];
  quizExplanation?: string;
};

type CourseIn = {
  slug: string;
  title: string;
  description: string;
  category: string;
  required: boolean;
  badgeLabel: string;
  badgeColor: string | null;
  estimatedMinutes: number;
  passingScore: number;
  slides: SlideIn[];
};

const COURSES: CourseIn[] = [
  {
    slug: "tinies-safety-basics",
    title: "Tinies Safety Basics",
    description:
      "Platform standards, emergency protocols, the Tinies Guarantee, and how to deliver care owners trust.",
    category: "essential",
    required: true,
    badgeLabel: "Safety Certified",
    badgeColor: "primary",
    estimatedMinutes: 35,
    passingScore: 80,
    slides: [
      {
        slideNumber: 1,
        title: "Welcome to Tinies",
        slideType: "lesson",
        content: `## What Tinies expects from you

You are an **independent professional** on a marketplace built for trust. Owners book you because they believe their pet will be safe, respected, and well cared for.

- **Be reliable** — honour times, instructions, and commitments you accept.
- **Be transparent** — if something changes, communicate early and clearly.
- **Be kind** — to animals and people; disputes are handled with documentation and calm communication.

This course sets the baseline every provider on Tinies shares.`,
      },
      {
        slideNumber: 2,
        title: "Before every booking",
        slideType: "lesson",
        content: `## Checklist before you start

- **Confirm details** — service type, window, address, access, and emergency contacts in the app.
- **Review the pet profile** — species, behaviour notes, medications, allergies, vet details.
- **Prepare your space** — secure exits, remove hazards, have water, waste bags, and any agreed supplies ready.

If anything is unclear, **message the owner before** the booking begins.`,
      },
      {
        slideNumber: 3,
        title: "During the service",
        slideType: "lesson",
        content: `## While the pet is in your care

- Send **photo updates** as agreed (at minimum when the platform or owner expects them).
- Follow **feeding, medication, and exercise** instructions exactly; never improvise with meds.
- Keep pets **secure** — leashes, gates, crates, and doors; assume they may bolt if startled.
- Use the **walk tracker** for walks so owners can follow along when the feature is active.`,
      },
      {
        slideNumber: 4,
        title: "Emergency protocol",
        slideType: "lesson",
        content: `## If something goes wrong

**Pet escapes** — notify the owner immediately, search the immediate area calmly, and enlist help if needed.

**Injury or sudden illness** — contact the owner and the nearest appropriate vet; follow owner / vet instructions and keep records.

**You are not alone** — serious incidents may involve Tinies support and the **Tinies Guarantee** process; document what happened with times, photos, and messages.`,
      },
      {
        slideNumber: 5,
        title: "The Tinies Guarantee",
        slideType: "lesson",
        content: `## What it covers — and your responsibilities

The Guarantee is there to protect pets and owners when things go wrong. It has **limits and conditions** published in our terms.

- Report issues **promptly** through the app.
- **Cooperate** with any review — honesty and documentation matter.
- The Guarantee does **not** replace your duty of care, insurance where applicable, or compliance with law.

When in doubt, **document first**, then escalate through Tinies channels.`,
      },
      {
        slideNumber: 6,
        title: "Communication standards",
        slideType: "lesson",
        content: `## Professional messaging

- Aim to **respond to booking requests within 4 hours** (sooner is better).
- Keep tone **respectful and clear** — no pressure, no guilt, no inappropriate content.
- For complaints, **stay factual**, offer solutions, and use Tinies dispute tools if you cannot resolve it directly.`,
      },
      {
        slideNumber: 7,
        title: "After the booking",
        slideType: "lesson",
        content: `## Wrapping up well

- Mark the service **complete** when finished and leave brief notes if the app allows.
- **Reviews** help you grow — thank owners who leave them; respond professionally to feedback.
- **Tips** are appreciated but never required; thank the owner graciously.`,
      },
      {
        slideNumber: 8,
        title: "Your commitment",
        slideType: "lesson",
        content: `## The Tinies Code

**Every pet in your care deserves the same love and vigilance as your own.**

That means patience when they are scared, consistency when they are excited, and courage to ask for help when something is beyond your comfort level.

Thank you for representing Tinies and the animals who depend on us.`,
      },
      {
        slideNumber: 9,
        title: "Quiz: Escaped dog",
        slideType: "quiz",
        content: "",
        quizQuestion: "A dog in your care escapes from the garden. What's your first action?",
        quizOptions: [
          { text: "Immediately notify the owner and begin searching the area", isCorrect: true },
          { text: "Wait indoors to see if the dog comes back on its own", isCorrect: false },
          { text: "Finish your current task before notifying anyone", isCorrect: false },
          { text: "Only notify the owner if the dog is gone for more than an hour", isCorrect: false },
        ],
        quizExplanation:
          "Speed and communication matter. Notify the owner right away and start a calm, organised search nearby.",
      },
      {
        slideNumber: 10,
        title: "Quiz: Medication dosage",
        slideType: "quiz",
        content: "",
        quizQuestion:
          "An owner asks you to give their cat medication but the dosage seems wrong. What do you do?",
        quizOptions: [
          { text: "Contact the owner to confirm before administering", isCorrect: true },
          { text: "Use half the amount to be safe", isCorrect: false },
          { text: "Skip the dose and mention it later", isCorrect: false },
          { text: "Ask a neighbour what they would do", isCorrect: false },
        ],
        quizExplanation: "Never guess with medication. Confirm with the owner (or their vet if they direct you) before giving anything.",
      },
      {
        slideNumber: 11,
        title: "Quiz: Booking requests",
        slideType: "quiz",
        content: "",
        quizQuestion: "How quickly should you respond to a booking request?",
        quizOptions: [
          { text: "Within 4 hours", isCorrect: true },
          { text: "Within 24 hours", isCorrect: false },
          { text: "Only when you are free that day", isCorrect: false },
          { text: "There is no specific expectation", isCorrect: false },
        ],
        quizExplanation: "Tinies expects providers to accept or decline within **4 hours** so owners can plan.",
      },
      {
        slideNumber: 12,
        title: "Quiz: Photo updates",
        slideType: "quiz",
        content: "",
        quizQuestion: "When should you send photo updates to the owner?",
        quizOptions: [
          { text: "At least once during every booking", isCorrect: true },
          { text: "Only if the owner messages first", isCorrect: false },
          { text: "Only for new clients", isCorrect: false },
          { text: "Only at the end of a multi-day stay", isCorrect: false },
        ],
        quizExplanation: "Photo updates build trust. Send them **at least once per booking** (more if agreed).",
      },
    ],
  },
  {
    slug: "pet-first-aid",
    title: "Pet First Aid",
    description: "Recognise emergencies, act safely in Cyprus heat, and assemble a sensible first aid kit.",
    category: "specialized",
    required: false,
    badgeLabel: "First Aid Trained",
    badgeColor: "secondary",
    estimatedMinutes: 28,
    passingScore: 80,
    slides: [
      {
        slideNumber: 1,
        title: "Recognising emergencies",
        slideType: "lesson",
        content: `## When minutes matter

Watch for **heatstroke** (heavy panting, drooling, weakness, collapse), **choking** (gagging, pawing mouth, blue-tinged gums), **poisoning** (drooling, vomiting, seizures, sudden collapse), and **shock** (weak pulse, pale gums, rapid breathing, lethargy).

When unsure, **call a vet**. You are aiming to stabilise and transport, not to replace veterinary care.`,
      },
      {
        slideNumber: 2,
        title: "Heatstroke",
        slideType: "lesson",
        content: `## Cyprus summers are extreme (40°C+)

**Signs:** excessive panting, thick saliva, weakness, vomiting, wobbling, collapse.

**Actions:**
- Move the animal to **shade or air-conditioning** immediately.
- Offer **small amounts of cool (not ice-cold) water**.
- Cool **paws, belly, and armpits** with lukewarm water — avoid ice baths.
- **Go to the vet** — heatstroke can progress quickly even if they seem better.`,
      },
      {
        slideNumber: 3,
        title: "Choking and breathing",
        slideType: "lesson",
        content: `## Airway issues

**Signs:** distress, exaggerated swallowing, pawing at the mouth, noisy breathing.

**If safe:** open the mouth gently and look for a visible object — remove only if you can do so **without being bitten** and without pushing it deeper.

**When NOT to intervene:** if the animal is still breathing, swallowing, or you risk injury — **vet immediately**. Do not perform blind finger sweeps.`,
      },
      {
        slideNumber: 4,
        title: "Cuts and bleeding",
        slideType: "lesson",
        content: `## Bleeding control

- Apply **firm direct pressure** with a clean cloth or gauze.
- Elevate the limb if practical and the animal tolerates it.
- **Deep wounds, non-stop bleeding, or paw pad injuries** — vet as soon as possible.
- Stay calm; your tone helps the animal stay calmer too.`,
      },
      {
        slideNumber: 5,
        title: "Poisoning",
        slideType: "lesson",
        content: `## Common dangers in Cyprus

**Oleander, rat poison, antifreeze, slug bait, human medications** — all emergencies.

**Do not induce vomiting** unless a vet explicitly instructs you — some toxins cause more damage coming back up.

**Call the vet** with the product name or plant if known, and follow their instructions.`,
      },
      {
        slideNumber: 6,
        title: "Your first aid kit",
        slideType: "lesson",
        content: `## What to carry

- Gauze, non-stick pads, cohesive bandage
- Saline solution (for rinsing debris from eyes or small wounds)
- Tweezers, tick tool, disposable gloves
- **Emergency vet number** and the **owner's vet** in your phone

Replace used items so your kit is always ready.`,
      },
      {
        slideNumber: 7,
        title: "Quiz: Heat stress",
        slideType: "quiz",
        content: "",
        quizQuestion: "A dog is panting heavily and wobbling after a walk in 40°C heat. What's happening?",
        quizOptions: [
          { text: "Heatstroke", isCorrect: true },
          { text: "Normal tiredness", isCorrect: false },
          { text: "Mild thirst only", isCorrect: false },
          { text: "Allergic reaction only", isCorrect: false },
        ],
        quizExplanation: "These signs in high heat strongly suggest heatstroke until proven otherwise — treat as an emergency.",
      },
      {
        slideNumber: 8,
        title: "Quiz: Oleander",
        slideType: "quiz",
        content: "",
        quizQuestion: "You find a cat has eaten something from an oleander bush. What do you do?",
        quizOptions: [
          { text: "Do not induce vomiting, call the vet immediately", isCorrect: true },
          { text: "Induce vomiting at home with salt water", isCorrect: false },
          { text: "Wait and observe for 24 hours", isCorrect: false },
          { text: "Give milk to dilute the toxin", isCorrect: false },
        ],
        quizExplanation: "Oleander is highly toxic. Do not induce vomiting without vet guidance — call the vet immediately.",
      },
      {
        slideNumber: 9,
        title: "Quiz: Bleeding paw",
        slideType: "quiz",
        content: "",
        quizQuestion: "A dog has a deep cut on its paw that won't stop bleeding. First action?",
        quizOptions: [
          { text: "Apply direct pressure with clean cloth and head to the vet", isCorrect: true },
          { text: "Let it air-dry to heal naturally", isCorrect: false },
          { text: "Wash only with soap and leave it", isCorrect: false },
          { text: "Wrap tightly until the paw goes numb", isCorrect: false },
        ],
        quizExplanation: "Direct pressure controls bleeding; deep cuts need veterinary assessment.",
      },
      {
        slideNumber: 10,
        title: "Quiz: First aid kit",
        slideType: "quiz",
        content: "",
        quizQuestion: "Which of these should be in your pet first aid kit?",
        quizOptions: [
          { text: "All of the above — gauze, saline solution, emergency vet number", isCorrect: true },
          { text: "Only gauze", isCorrect: false },
          { text: "Only saline", isCorrect: false },
          { text: "Only the emergency vet number", isCorrect: false },
        ],
        quizExplanation: "A useful kit combines bandaging, rinsing, tools, and **ready-to-dial** vet contacts.",
      },
    ],
  },
  {
    slug: "safe-dog-walking",
    title: "Safe Dog Walking",
    description: "Leash skills, heat safety, multi-dog management, and the Tinies walk tracker.",
    category: "specialized",
    required: false,
    badgeLabel: "Walking Pro",
    badgeColor: "primary-700",
    estimatedMinutes: 26,
    passingScore: 80,
    slides: [
      {
        slideNumber: 1,
        title: "Before the walk",
        slideType: "lesson",
        content: `## Pre-walk checks

- **Leash and collar / harness** fit snugly (two fingers under flat collars).
- **ID tag** visible; you know the **planned route** and any triggers from the profile.
- **Water** for warm days; **waste bags** always.
- Confirm **how many dogs** you are walking and that it matches your skills and insurance.`,
      },
      {
        slideNumber: 2,
        title: "Leash handling",
        slideType: "lesson",
        content: `## Control without tension

- Hold with a **secure but relaxed** grip; never wrap the leash around your wrist.
- For **reactive dogs**, increase distance from triggers early; use treats and calm redirects if the owner approves.
- **Sudden lunges** — plant feet, absorb with your core, do not chase the dog with slack leash.`,
      },
      {
        slideNumber: 3,
        title: "Multi-dog walks",
        slideType: "lesson",
        content: `## More dogs, more planning

- Match **energy levels** where possible; avoid mixing unknown reactive dogs.
- Prevent **leash tangles** by positioning dogs on consistent sides.
- **Tinies guidance:** walk **no more than three dogs** unless you are highly experienced, the dogs are compatible, and owners have agreed.`,
      },
      {
        slideNumber: 4,
        title: "Traffic and hazards",
        slideType: "lesson",
        content: `## Cyprus-specific risks

- **Road crossings** — short leash, clear commands, eye contact with drivers when needed.
- **Glass, debris, and hot paths** — scan ahead.
- **Other dogs and strays** — give space; avoid feeding stations that attract guarding behaviour.
- If a situation feels unsafe, **change route** — discretion beats bravado.`,
      },
      {
        slideNumber: 5,
        title: "Heat awareness",
        slideType: "lesson",
        content: `## Summer walking

- Prefer **early morning or late evening** in peak summer.
- **Pavement test:** hold the **back of your hand** on the ground for **~7 seconds** — if it is too hot for you, it is too hot for paws.
- Carry **water** and offer shade breaks.`,
      },
      {
        slideNumber: 6,
        title: "GPS tracking",
        slideType: "lesson",
        content: `## Tinies walk tracker

- Start the walk from the app when the service begins.
- Keep your **phone charged** and location enabled as required.
- Owners may see **route and activity** — this is a trust feature; accuracy matters.`,
      },
      {
        slideNumber: 7,
        title: "Quiz: Midday heat",
        slideType: "quiz",
        content: "",
        quizQuestion: "It's 2pm in July in Limassol, 38°C. An owner requests a walk. What do you do?",
        quizOptions: [
          {
            text: "Suggest rescheduling to early morning or evening, explain heat risks",
            isCorrect: true,
          },
          { text: "Walk as requested without discussion", isCorrect: false },
          { text: "Walk only on grass so paws are fine", isCorrect: false },
          { text: "Halve the walk time and skip water", isCorrect: false },
        ],
        quizExplanation: "Heat risk to dogs is severe at peak temperatures — reschedule or offer a very short toilet break with owner agreement.",
      },
      {
        slideNumber: 8,
        title: "Quiz: Reactive dog",
        slideType: "quiz",
        content: "",
        quizQuestion:
          "You're walking two dogs and one becomes reactive toward a stray cat. What do you do?",
        quizOptions: [
          { text: "Move both dogs away calmly, create distance, wait for them to settle", isCorrect: true },
          { text: "Let the reactive dog approach to desensitise", isCorrect: false },
          { text: "Drop the leashes so they can flee", isCorrect: false },
          { text: "Yell loudly at the cat", isCorrect: false },
        ],
        quizExplanation: "Distance and calm handling protect everyone; never force proximity.",
      },
      {
        slideNumber: 9,
        title: "Quiz: Hot pavement",
        slideType: "quiz",
        content: "",
        quizQuestion: "How do you check if pavement is too hot for paw pads?",
        quizOptions: [
          {
            text: "Hold the back of your hand on the ground for 7 seconds — if too hot for you, too hot for them",
            isCorrect: true,
          },
          { text: "Pour water; if it steams, it's too hot", isCorrect: false },
          { text: "Only check air temperature", isCorrect: false },
          { text: "Walk barefoot yourself for 1 minute", isCorrect: false },
        ],
        quizExplanation: "The hand test is a simple, widely used rule of thumb for radiant heat on surfaces.",
      },
      {
        slideNumber: 10,
        title: "Quiz: Pack size",
        slideType: "quiz",
        content: "",
        quizQuestion: "What's the maximum recommended dogs for one walker?",
        quizOptions: [
          { text: "3, unless experienced with more and the dogs are compatible", isCorrect: true },
          { text: "As many as fit on the sidewalk", isCorrect: false },
          { text: "1 always", isCorrect: false },
          { text: "6 if they are small", isCorrect: false },
        ],
        quizExplanation: "Three is the default safe ceiling unless you have proven experience and owner agreement for compatible groups.",
      },
    ],
  },
  {
    slug: "cat-care-specialist",
    title: "Cat Care Specialist",
    description: "Feline behaviour, drop-in routines, litter maths, and safe handling.",
    category: "specialized",
    required: false,
    badgeLabel: "Cat Care Specialist",
    badgeColor: "primary-900",
    estimatedMinutes: 28,
    passingScore: 80,
    slides: [
      {
        slideNumber: 1,
        title: "Understanding cats",
        slideType: "lesson",
        content: `## Cats are not small dogs

- They are **territory-focused** and sensitive to change.
- **Stress** shows as hiding, reduced eating, over-grooming, or aggression.
- Let cats **choose** when to interact; forced handling erodes trust quickly.`,
      },
      {
        slideNumber: 2,
        title: "The home visit",
        slideType: "lesson",
        content: `## Drop-ins and sitting

- **Minimise disruption** — quiet entry, no loud music, respect closed doors.
- Keep **feeding times** and portions exact; note appetite in your update.
- **Litter:** scoop as agreed; note unusual odour, straining, or blood (vet flag).`,
      },
      {
        slideNumber: 3,
        title: "Cat body language",
        slideType: "lesson",
        content: `## Read the ears and tail

- **Relaxed:** soft eyes, forward ears, tail up with a gentle curve.
- **Fear / aggression:** flattened ears, puffed tail, hissing, swatting — **give space**.
- Never corner a stressed cat; allow **exit routes** always.`,
      },
      {
        slideNumber: 4,
        title: "Multi-cat households",
        slideType: "lesson",
        content: `## Resources prevent fights

- **Feeding stations** separated visually and in space where possible.
- **Litter boxes:** use the **n+1 rule** (one box per cat plus one extra).
- If conflict erupts, **do not grab** mid-fight — distract with sound from a distance, then separate safely.`,
      },
      {
        slideNumber: 5,
        title: "Medication and health",
        slideType: "lesson",
        content: `## Pills, drops, red flags

- Follow **owner-demonstrated** technique; if instructions are missing, **ask before** attempting.
- Watch for **URI** symptoms (snotty nose, goopy eyes), **dental** pain (drooling, pawing mouth), **urinary** signs (straining, crying in tray — emergency in males especially).`,
      },
      {
        slideNumber: 6,
        title: "Indoor vs outdoor",
        slideType: "lesson",
        content: `## Cyprus context

- Many rescues are **indoor-only** or have **controlled outdoor** access.
- **Escape prevention:** secure windows, balconies, and doors; check microchip details if the owner asks.
- Never let a cat outdoors **unless** the owner's written routine explicitly allows it.`,
      },
      {
        slideNumber: 7,
        title: "Quiz: Hiding cat",
        slideType: "quiz",
        content: "",
        quizQuestion: "A cat is hiding under the bed and won't come out for feeding. What do you do?",
        quizOptions: [
          {
            text: "Leave food nearby, give them space, check back in 30 minutes — never force them out",
            isCorrect: true,
          },
          { text: "Pull them out gently so they eat on schedule", isCorrect: false },
          { text: "Cancel the visit", isCorrect: false },
          { text: "Shake the food bowl loudly until they emerge", isCorrect: false },
        ],
        quizExplanation: "Stress kills appetite; patience and choice reduce fear.",
      },
      {
        slideNumber: 8,
        title: "Quiz: Litter boxes",
        slideType: "quiz",
        content: "",
        quizQuestion: "How many litter boxes should a household with 3 cats have?",
        quizOptions: [
          { text: "4 — the n+1 rule", isCorrect: true },
          { text: "2", isCorrect: false },
          { text: "3 exactly", isCorrect: false },
          { text: "1 large shared box", isCorrect: false },
        ],
        quizExplanation: "n+1 reduces conflict and inappropriate elimination.",
      },
      {
        slideNumber: 9,
        title: "Quiz: Body language",
        slideType: "quiz",
        content: "",
        quizQuestion: "A cat's ears are flattened and tail is puffed up. What does this mean?",
        quizOptions: [
          { text: "Fear or aggression — give space, do not approach", isCorrect: true },
          { text: "Happy and playful", isCorrect: false },
          { text: "Hungry only", isCorrect: false },
          { text: "Sleepy", isCorrect: false },
        ],
        quizExplanation: "These are distance-increasing signals — respect them.",
      },
      {
        slideNumber: 10,
        title: "Quiz: Pills",
        slideType: "quiz",
        content: "",
        quizQuestion: "You need to give a cat a pill. The owner left no instructions. What do you do?",
        quizOptions: [
          { text: "Contact the owner for specific instructions before attempting", isCorrect: true },
          { text: "Hide it in any human food you have", isCorrect: false },
          { text: "Skip silently", isCorrect: false },
          { text: "Crush and mix with milk", isCorrect: false },
        ],
        quizExplanation: "Medication routes and foods vary; owner or vet direction is required.",
      },
    ],
  },
];

export async function seedTrainingCourses(prisma: PrismaClient): Promise<void> {
  for (const c of COURSES) {
    const totalSlides = c.slides.length;
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        category: c.category,
        required: c.required,
        badgeLabel: c.badgeLabel,
        badgeColor: c.badgeColor,
        estimatedMinutes: c.estimatedMinutes,
        totalSlides,
        passingScore: c.passingScore,
        active: true,
      },
      update: {
        title: c.title,
        description: c.description,
        category: c.category,
        required: c.required,
        badgeLabel: c.badgeLabel,
        badgeColor: c.badgeColor,
        estimatedMinutes: c.estimatedMinutes,
        totalSlides,
        passingScore: c.passingScore,
        active: true,
      },
    });

    await prisma.courseSlide.deleteMany({ where: { courseId: course.id } });

    const slideRows: Prisma.CourseSlideCreateManyInput[] = c.slides.map((s) => {
      const row: Prisma.CourseSlideCreateManyInput = {
        courseId: course.id,
        slideNumber: s.slideNumber,
        title: s.title,
        content: s.content,
        imageUrl: s.imageUrl ?? null,
        slideType: s.slideType,
        quizQuestion: s.quizQuestion ?? null,
        quizExplanation: s.quizExplanation ?? null,
      };
      if (s.slideType === "quiz" && s.quizOptions) {
        row.quizOptions = s.quizOptions as unknown as Prisma.InputJsonValue;
      }
      return row;
    });

    await prisma.courseSlide.createMany({ data: slideRows });
  }
  console.log(`Seeded ${COURSES.length} training courses with slides.`);
}

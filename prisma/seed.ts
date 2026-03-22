/**
 * Tinies database seed — realistic test data for Cyprus.
 * Run: npx tsx prisma/seed.ts   (or: npx prisma db seed)
 * Ensure migrations are applied first: npx prisma migrate deploy
 */

import { AdoptionListingStatus, Prisma, PrismaClient } from "@prisma/client";
import { seedTrainingCourses } from "./seed-training-courses";
import { seedSiteImages } from "./seed-site-images";

const prisma = new PrismaClient();

/** Rich profile showcase data for public provider pages (Maria & Andreas). */
const RICH_PROVIDER_BY_SLUG: Record<
  string,
  {
    headline: string;
    whyIDoThis: string;
    experienceTags: string[];
    qualifications: Prisma.InputJsonValue;
    languages: string[];
    homeDescription: string;
    previousExperience: string;
    emergencyProtocol: string;
    responseTimeMinutes?: number;
    repeatClientRate?: number;
    backgroundCheckPassed?: boolean;
  }
> = {
  "maria-georgiou": {
    headline: "Boarding and daycare with a spacious garden in Nicosia",
    whyIDoThis:
      "I grew up surrounded by animals on my family's farm. Now I channel that love into professional pet care. Every animal deserves to feel safe and loved.",
    experienceTags: ["dogs", "puppies", "large breeds", "multiple pets", "medical needs"],
    qualifications: [
      { title: "Pet First Aid Certificate", issuer: "Cyprus Red Cross", year: 2023 },
    ],
    languages: ["English", "Greek"],
    homeDescription:
      "Detached house with enclosed garden in a quiet Nicosia neighbourhood. Separate pet room with beds, toys, and water stations.",
    previousExperience: "5 years professional boarding and daycare. Previously volunteered at local animal welfare groups.",
    emergencyProtocol:
      "Pet first aid kit always ready. Nearest emergency vet is a short drive away; I keep owner and vet contacts on hand.",
    responseTimeMinutes: 90,
    repeatClientRate: 85,
    backgroundCheckPassed: true,
  },
  "andreas-christou": {
    headline: "Trusted dog walking and pet sitting in Limassol",
    whyIDoThis:
      "Dogs are family. Whether I am walking your dog or staying in your home, they get calm, consistent care and the attention they deserve.",
    experienceTags: ["dogs", "puppies", "active breeds", "leash skills"],
    qualifications: [{ title: "Canine Behavior Certificate", issuer: "Online Academy", year: 2024 }],
    languages: ["English", "Greek", "Russian"],
    homeDescription:
      "House with secure garden in Limassol. Quiet area for drop-offs; I also travel to your home for sitting as agreed.",
    previousExperience: "Years of daily dog walking and home sits across Limassol.",
    emergencyProtocol: "Pet first aid kit on hand. I know the nearest 24-hour vet in Limassol.",
    responseTimeMinutes: 120,
    repeatClientRate: 78,
    backgroundCheckPassed: true,
  },
};

const TEST_PASSWORD_HASH = "supabase-auth-placeholder";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Weekdays ~8am–6pm: Morning + Afternoon Mon–Fri (matches provider dashboard slot keys). */
function seedWeekdayAvailability(): Record<string, boolean> {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["Morning", "Afternoon", "Evening"];
  const out: Record<string, boolean> = {};
  days.forEach((d) =>
    slots.forEach((s) => {
      out[`${d}-${s}`] = d !== "Sat" && d !== "Sun" && (s === "Morning" || s === "Afternoon");
    })
  );
  return out;
}

// ---------------------------------------------------------------------------
// 1. Six verified service providers (User + ProviderProfile)
// ---------------------------------------------------------------------------

const PROVIDERS = [
  {
    name: "Andreas Christou",
    email: "andreas@test.tinies.app",
    slug: "andreas-christou",
    district: "Limassol",
    bio: "Reliable dog walker and pet sitter based in Limassol. I grew up with dogs and know how much routine matters when you are away. I send photo updates, stick to feeding instructions, and keep walks calm and safe in your neighbourhood.",
    lat: 34.6786,
    lng: 33.0413,
    homeType: "house",
    hasYard: true,
    yardFenced: true,
    services: [
      { type: "walking", base_price: 1500, additional_pet_price: 700, price_unit: "per_visit", max_pets: 3 },
      { type: "sitting", base_price: 2500, additional_pet_price: 1000, price_unit: "per_day", max_pets: 2 },
    ],
  },
  {
    name: "Maria Georgiou",
    email: "maria@test.tinies.app",
    slug: "maria-georgiou",
    district: "Nicosia",
    bio: "Home boarding and daycare in a quiet Nicosia neighbourhood. Your dog joins a small, supervised group with plenty of garden time. I am experienced with anxious dogs and happy to follow vet diets or medication schedules.",
    lat: 35.1856,
    lng: 33.3823,
    homeType: "house",
    hasYard: true,
    yardFenced: true,
    services: [
      { type: "boarding", base_price: 3000, additional_pet_price: 1200, price_unit: "per_night", max_pets: 2 },
      { type: "daycare", base_price: 2000, additional_pet_price: 800, price_unit: "per_day", max_pets: 3 },
    ],
  },
  {
    name: "Elena Papadopoulou",
    email: "elena@test.tinies.app",
    slug: "elena-papadopoulou",
    district: "Paphos",
    bio: "Dog walking and drop-in visits across Paphos. I focus on consistent timing, fresh water, and gentle handling for nervous pets. Great for working owners who need someone trustworthy during the day.",
    lat: 34.7754,
    lng: 32.4218,
    homeType: "apartment",
    hasYard: false,
    yardFenced: false,
    services: [
      { type: "walking", base_price: 1200, additional_pet_price: 600, price_unit: "per_visit", max_pets: 3 },
      { type: "drop_in", base_price: 1000, additional_pet_price: 400, price_unit: "per_visit", max_pets: 4 },
    ],
  },
  {
    name: "Nikos Stavrou",
    email: "nikos@test.tinies.app",
    slug: "nikos-stavrou",
    district: "Larnaca",
    bio: "Full-service pet care near the Larnaca coast — walks, stays, drop-ins, and daycare. I enjoy high-energy dogs and multi-pet homes. Fenced outdoor space, clear communication, and flexible pickup windows when we agree them in advance.",
    lat: 34.9229,
    lng: 33.6233,
    homeType: "house",
    hasYard: true,
    yardFenced: true,
    services: [
      { type: "walking", base_price: 1500, additional_pet_price: 700, price_unit: "per_visit", max_pets: 3 },
      { type: "sitting", base_price: 2200, additional_pet_price: 900, price_unit: "per_day", max_pets: 2 },
      { type: "boarding", base_price: 2800, additional_pet_price: 1100, price_unit: "per_night", max_pets: 2 },
      { type: "drop_in", base_price: 1200, additional_pet_price: 500, price_unit: "per_visit", max_pets: 4 },
      { type: "daycare", base_price: 1800, additional_pet_price: 700, price_unit: "per_day", max_pets: 3 },
    ],
  },
  {
    name: "Sofia Andreou",
    email: "sofia@test.tinies.app",
    slug: "sofia-andreou",
    district: "Limassol",
    bio: "Cat-focused sitting and drop-in visits in Limassol. I respect shy cats, keep litter tidy, and watch for appetite changes. Dogs welcome too for drop-ins if we have met them first — I prioritise calm, low-stress visits.",
    lat: 34.704,
    lng: 33.045,
    homeType: "apartment",
    hasYard: false,
    yardFenced: false,
    services: [
      { type: "sitting", base_price: 2000, additional_pet_price: 800, price_unit: "per_day", max_pets: 2 },
      { type: "drop_in", base_price: 1200, additional_pet_price: 500, price_unit: "per_visit", max_pets: 4 },
    ],
  },
  {
    name: "Yiannis Konstantinou",
    email: "yiannis@test.tinies.app",
    slug: "yiannis-konstantinou",
    district: "Nicosia",
    bio: "Dog walking and overnight boarding in central Nicosia. Your dog sleeps indoors, gets two walks a day when boarding, and I only take compatible dogs together. Transparent updates and a stress-free handover every time.",
    lat: 35.172,
    lng: 33.365,
    homeType: "house",
    hasYard: true,
    yardFenced: true,
    services: [
      { type: "walking", base_price: 1400, additional_pet_price: 650, price_unit: "per_visit", max_pets: 3 },
      { type: "boarding", base_price: 2500, additional_pet_price: 1000, price_unit: "per_night", max_pets: 2 },
    ],
  },
];

const PROVIDER_SEED_EMAILS = PROVIDERS.map((p) => p.email);

/**
 * Drops legacy / duplicate test providers (e.g. old "Sophie Williams") so search only shows the six canonical seed providers.
 * Only targets accounts that are clearly non-canonical: wrong @test.tinies.app email, sophie-williams slug, or name "Sophie Williams".
 */
async function removeStaleSeedProviderAccounts(): Promise<void> {
  const whitelist = new Set(PROVIDER_SEED_EMAILS);
  const candidates = await prisma.user.findMany({
    where: {
      role: "provider",
      providerProfile: { isNot: null },
      AND: [
        { email: { notIn: [...whitelist] } },
        {
          OR: [
            { email: { endsWith: "@test.tinies.app" } },
            { providerProfile: { is: { slug: { equals: "sophie-williams", mode: "insensitive" } } } },
            { name: { contains: "Sophie Williams", mode: "insensitive" } },
          ],
        },
      ],
    },
    select: { id: true, email: true },
  });

  for (const { id, email } of candidates) {
    try {
      await prisma.review.deleteMany({ where: { providerId: id } });
      await prisma.payout.deleteMany({ where: { providerId: id } });
      await prisma.tiniesCard.deleteMany({ where: { providerId: id } });
      await prisma.booking.deleteMany({ where: { providerId: id } });
      await prisma.recurringBooking.deleteMany({ where: { OR: [{ providerId: id }, { ownerId: id }] } });
      await prisma.bookingUpdate.deleteMany({ where: { providerId: id } });
      await prisma.meetAndGreet.deleteMany({ where: { OR: [{ providerId: id }, { ownerId: id }] } });
      await prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { recipientId: id }] } });
      await prisma.providerCertification.deleteMany({ where: { providerId: id } });
      await prisma.providerFavorite.deleteMany({ where: { OR: [{ providerId: id }, { ownerId: id }] } });
      await prisma.providerProfile.delete({ where: { userId: id } });
      await prisma.user.delete({ where: { id } });
      console.log(`Removed stale provider account: ${email}`);
    } catch (e) {
      console.warn(`Could not fully remove stale provider ${email}:`, e);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Three charities
// ---------------------------------------------------------------------------

const CHARITIES = [
  {
    name: "Gardens of St Gertrude",
    slug: "gardens-of-st-gertrude",
    mission:
      "Since 2017, founders have invested EUR 460,000+ in rescue across Cyprus — 92 cats in daily sanctuary care, 160+ spayed/neutered, and vet support for other rescues.",
    website: "https://gardensofstgertrude.com",
    featured: true,
    district: "Limassol",
    animalsInCare: 92,
  },
  {
    name: "Paws of Cyprus",
    slug: "paws-of-cyprus",
    mission: "Rescuing and rehoming abandoned dogs across Cyprus since 2015.",
    website: null,
    featured: true,
    district: "Limassol",
    animalsInCare: null,
  },
  {
    name: "Cyprus Cat Rescue",
    slug: "cyprus-cat-rescue",
    mission: "A network of foster homes and volunteers saving cats across every district in Cyprus.",
    website: null,
    featured: false,
    district: null,
    animalsInCare: null,
  },
  {
    name: "Patch of Heaven Animal Haven",
    slug: "patch-of-heaven",
    mission: "A safe home for abused, abandoned, senior, and disabled cats in Limassol.",
    website: "https://patchofheavencats.com",
    featured: true,
    district: "Limassol",
    animalsInCare: 100,
  },
];

// ---------------------------------------------------------------------------
// 3. Gardens of St Gertrude — real cat listings (GitHub-hosted photos)
// ---------------------------------------------------------------------------

const GARDENS_ORG_SLUG = "gardens-of-st-gertrude";
const GARDENS_DESTINATIONS = ["UK", "Germany", "Netherlands", "Sweden", "Austria", "Switzerland"];

type GardensCatSeed = {
  name: string;
  /** Memorial listings stay public by URL but are excluded from adoption browse. */
  memorial?: boolean;
  breed: string;
  sex: string;
  estimatedAge: string;
  temperament: string;
  medicalHistory: string | null;
  specialNeeds: string | null;
  backstory: string;
  personality: string;
  idealHome: string | null;
  goodWith: string[];
  notGoodWith: string[];
  /** YouTube or direct URL; omit for null */
  videoUrl?: string | null;
  fosterLocation: string;
  photo: string;
  alternateNames?: string[];
  nameStory?: string | null;
  lineageTitle?: string | null;
  motherName?: string | null;
  fatherName?: string | null;
  familyNotes?: string | null;
};

const GARDENS_CATS: GardensCatSeed[] = [
  {
    name: "Charlie",
    breed: "Domestic Shorthair",
    sex: "male",
    estimatedAge: "3 years",
    temperament: "Friendly, confident, loves attention",
    medicalHistory: null,
    specialNeeds: null,
    backstory:
      "Charlie was found as a kitten hiding under a car in Limassol. A volunteer brought him to the sanctuary at just 4 weeks old. He's been here ever since and has become the unofficial welcoming committee.",
    personality:
      "Confident and social, Charlie greets every visitor. He'll head-bump your legs until you pick him up. Loves being held like a baby.",
    idealHome: "Any loving home — Charlie adapts to everything. He'd thrive with another cat for company.",
    goodWith: ["other cats", "dogs", "children", "seniors"],
    notGoodWith: [],
    fosterLocation: "Gardens of St Gertrude, Parekklisia",
    photo: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/charlie_v2.jpg",
  },
  {
    name: "Mabel",
    breed: "Domestic Longhair",
    sex: "female",
    estimatedAge: "2 years",
    temperament: "Playful, curious, loves exploring",
    medicalHistory: null,
    specialNeeds: null,
    backstory:
      "Mabel was surrendered when her elderly owner moved to a care home. She arrived confused but quickly found her favorite sunny spot on the sanctuary wall.",
    personality:
      "Curious explorer who investigates every new box, bag, and visitor. Playful with feather toys but also loves a quiet afternoon nap.",
    idealHome: "A home with space to explore. Mabel loves windowsills and climbing.",
    goodWith: ["other cats", "children over 10"],
    notGoodWith: [],
    fosterLocation: "Gardens of St Gertrude, Parekklisia",
    photo: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/mabel.jpg",
    alternateNames: ["Mae"],
    nameStory: "Volunteers nicknamed her Mae within days of arrival.",
  },
  {
    name: "Oliver",
    memorial: true,
    breed: "Domestic Shorthair",
    sex: "male",
    estimatedAge: "5 years",
    temperament: "Gentle, resilient, endlessly affectionate",
    medicalHistory: null,
    specialNeeds: null,
    backstory:
      "Oliver was hit by a car on the highway near Parekklisia. His pelvis was shattered. After surgery and months of recovery at the sanctuary, he fought hard. Oliver passed away in January 2026. He was the most affectionate cat at the sanctuary — he'd curl up in your lap and purr for hours. He never stopped trusting people, even after everything. Oliver is why we do this.",
    personality:
      "Gentle, resilient, endlessly affectionate. Oliver would claim your lap the moment you sat down. He purred through everything — even his recovery.",
    idealHome: null,
    goodWith: ["seniors", "single people"],
    notGoodWith: ["small children", "dogs"],
    fosterLocation: "Gardens of St Gertrude, Parekklisia",
    photo: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/oliver_campaign.jpg",
  },
  {
    name: "Ziggy",
    breed: "Domestic Shorthair",
    sex: "male",
    estimatedAge: "1 year",
    temperament: "Energetic, playful, loves toys",
    medicalHistory: null,
    specialNeeds: null,
    backstory: "Ziggy was born at the sanctuary to a rescued pregnant mother. He's never known anything but love.",
    personality:
      "Pure energy. Ziggy plays with everything — bottle caps, shoelaces, other cats' tails. Will zoom around the room at 3am.",
    idealHome: "An active household that can handle kitten energy. Another young cat to play with would be ideal.",
    goodWith: ["other cats", "children", "active households"],
    notGoodWith: [],
    fosterLocation: "Gardens of St Gertrude, Parekklisia",
    photo: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/profile_ziggy.jpg",
    lineageTitle: "Of Gertian",
    motherName: "Gertie",
    familyNotes: "Born at the sanctuary.",
  },
  {
    name: "Splotch",
    breed: "Domestic Shorthair",
    sex: "female",
    estimatedAge: "3 years",
    temperament: "Sweet, quiet, loves lap time",
    medicalHistory: null,
    specialNeeds: null,
    backstory:
      "Splotch was found in a cardboard box outside a supermarket in Limassol with her three siblings. She was the smallest and needed bottle-feeding for two weeks.",
    personality:
      "Quiet and sweet. Splotch prefers one person and will claim your lap as her territory. Soft purr, gentle kneading.",
    idealHome: "A quieter home where she can be someone's devoted companion. Does well as a solo cat.",
    goodWith: ["seniors", "single people"],
    notGoodWith: ["dogs", "very young children"],
    fosterLocation: "Gardens of St Gertrude, Parekklisia",
    photo: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/splotch.jpg",
    familyNotes: "We think Splotch is the grandson of Rusty aka Rusty Sweet.",
  },
  {
    name: "Toshiba",
    breed: "Domestic Shorthair",
    sex: "male",
    estimatedAge: "4 years",
    temperament: "Independent, dignified, enjoys sunbathing",
    medicalHistory: null,
    specialNeeds: null,
    backstory:
      "Toshiba appeared at the sanctuary gate one morning and simply walked in like he owned the place. Nobody knows where he came from.",
    personality:
      "Independent and dignified. Toshiba chooses when he wants attention — and when he does, he's all in. Expert sunbather. Judges you silently.",
    idealHome: "A home with outdoor access or a secure garden. Toshiba likes his freedom.",
    goodWith: ["other cats", "dogs"],
    notGoodWith: ["very young children"],
    fosterLocation: "Gardens of St Gertrude, Parekklisia",
    photo: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/toshiba.jpg",
  },
];

async function ensureUniqueListingSlug(baseSlug: string): Promise<string> {
  const rows = await prisma.adoptionListing.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  });
  const used = new Set(rows.map((r) => r.slug));
  if (!used.has(baseSlug)) return baseSlug;
  let n = 1;
  while (used.has(`${baseSlug}-${n}`)) n += 1;
  return `${baseSlug}-${n}`;
}

// ---------------------------------------------------------------------------
// 4. Sample reviews (realistic 4–5 star text)
// ---------------------------------------------------------------------------

const REVIEW_TEXTS = [
  { rating: 5, text: "Andreas was fantastic. Our dog came back happy and tired. He sent photos during the walk and was very professional. Will definitely book again." },
  { rating: 5, text: "Maria looked after our two dogs for a week. Her setup is perfect for them and she kept us updated every day. Couldn't ask for more." },
  { rating: 4, text: "Elena was great with our cat. She followed all our instructions and left the flat spotless. Our cat was relaxed when we got home." },
  { rating: 5, text: "Nikos took our dog on amazing beach walks. You can tell he really cares. Highly recommend for active dogs." },
  { rating: 5, text: "Sofia is a total pro. She did a meet-and-greet first and put us at ease. Our cats had a calm week while we were away." },
  { rating: 4, text: "Very reliable and kind. Yiannis was flexible with timing when our flight was delayed. Thank you!" },
];

/** Search only returns providers who passed every active *required* course — seed passes for dev/staging. */
async function certifyAllProvidersForRequiredCourses(client: PrismaClient): Promise<void> {
  const requiredCourses = await client.course.findMany({
    where: { active: true, required: true },
    select: { id: true },
  });
  if (requiredCourses.length === 0) return;

  const profiles = await client.providerProfile.findMany({ select: { userId: true } });
  for (const { userId } of profiles) {
    for (const { id: courseId } of requiredCourses) {
      const certificateId = `seed-cert-${userId}-${courseId}`;
      await client.providerCertification.upsert({
        where: { providerId_courseId: { providerId: userId, courseId } },
        create: {
          providerId: userId,
          courseId,
          score: 95,
          passed: true,
          completedAt: new Date(),
          certificateId,
        },
        update: { passed: true, score: 95 },
      });
    }
  }
  console.log(`Certified ${profiles.length} provider(s) for ${requiredCourses.length} required course(s).`);
}

async function main() {
  console.log("Seeding Tinies database (Cyprus test data)...\n");

  await removeStaleSeedProviderAccounts();

  // ----- 1. Providers: User + ProviderProfile -----
  const providerUserIds: string[] = [];
  for (const p of PROVIDERS) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      create: {
        email: p.email,
        name: p.name,
        passwordHash: TEST_PASSWORD_HASH,
        role: "provider",
        emailVerified: true,
        district: p.district,
      },
      update: { name: p.name, district: p.district, emailVerified: true },
    });
    providerUserIds.push(user.id);

    const rich = RICH_PROVIDER_BY_SLUG[p.slug];

    await prisma.providerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        slug: p.slug,
        bio: p.bio,
        yearsExperience: 5,
        servicesOffered: p.services as object[],
        serviceAreaLat: p.lat,
        serviceAreaLng: p.lng,
        serviceAreaRadiusKm: 15,
        maxPets: 4,
        petTypesAccepted: "dogs,cats",
        verified: true,
        verifiedAt: new Date(),
        responseRate: 1,
        avgRating: 4.8,
        reviewCount: 0, // updated after reviews
        cancellationPolicy: "flexible",
        photos: [],
        homeType: p.homeType,
        hasYard: p.hasYard,
        yardFenced: p.yardFenced ?? false,
        smokingHome: false,
        dogsOnFurniture: true,
        typicalDay: "Morning walks or drop-ins, then home for admin. Afternoon visits. I keep a calm routine for boarding pets.",
        infoWantedAboutPet: "Diet, medication, vet contact, and how they get on with other animals.",
        availability: seedWeekdayAvailability() as object,
        ...(rich
          ? {
              headline: rich.headline,
              whyIDoThis: rich.whyIDoThis,
              experienceTags: rich.experienceTags,
              qualifications: rich.qualifications,
              languages: rich.languages,
              homeDescription: rich.homeDescription,
              previousExperience: rich.previousExperience,
              emergencyProtocol: rich.emergencyProtocol,
              responseTimeMinutes: rich.responseTimeMinutes ?? null,
              repeatClientRate: rich.repeatClientRate ?? null,
              backgroundCheckPassed: rich.backgroundCheckPassed ?? false,
            }
          : {}),
      },
      update: {
        bio: p.bio,
        servicesOffered: p.services as object[],
        serviceAreaLat: p.lat,
        serviceAreaLng: p.lng,
        verified: true,
        verifiedAt: new Date(),
        homeType: p.homeType,
        hasYard: p.hasYard,
        yardFenced: p.yardFenced ?? false,
        availability: seedWeekdayAvailability() as object,
        ...(rich
          ? {
              headline: rich.headline,
              whyIDoThis: rich.whyIDoThis,
              experienceTags: rich.experienceTags,
              qualifications: rich.qualifications,
              languages: rich.languages,
              homeDescription: rich.homeDescription,
              previousExperience: rich.previousExperience,
              emergencyProtocol: rich.emergencyProtocol,
              responseTimeMinutes: rich.responseTimeMinutes ?? null,
              repeatClientRate: rich.repeatClientRate ?? null,
              backgroundCheckPassed: rich.backgroundCheckPassed ?? false,
            }
          : {}),
      },
    });
  }
  console.log("Created 6 provider users and profiles.");

  // ----- 2. Charities -----
  const charityIds: string[] = [];
  for (const c of CHARITIES) {
    const charity = await prisma.charity.upsert({
      where: { slug: c.slug },
      create: {
        name: c.name,
        slug: c.slug,
        mission: c.mission,
        website: c.website,
        featured: c.featured,
        featuredSince: c.featured ? new Date() : null,
        district: c.district,
        animalsInCare: c.animalsInCare,
        verified: true,
        verifiedAt: new Date(),
        active: true,
        photos: [],
      },
      update: {
        mission: c.mission,
        website: c.website,
        featured: c.featured,
        district: c.district,
        animalsInCare: c.animalsInCare,
      },
    });
    charityIds.push(charity.id);
  }
  console.log(`Created ${CHARITIES.length} charities.`);

  // ----- 3. Remove placeholder Paws listings (empty photos / old seed data) -----
  const pawsOrg = await prisma.rescueOrg.findUnique({
    where: { slug: "paws-of-cyprus-rescue" },
  });
  if (pawsOrg) {
    const deleted = await prisma.adoptionListing.deleteMany({
      where: { orgId: pawsOrg.id },
    });
    if (deleted.count > 0) {
      console.log(`Removed ${deleted.count} placeholder adoption listing(s) from Paws of Cyprus.`);
    }
  }

  const rescueUser = await prisma.user.upsert({
    where: { email: "rescue@test.tinies.app" },
    create: {
      email: "rescue@test.tinies.app",
      name: "Paws of Cyprus Rescue",
      passwordHash: TEST_PASSWORD_HASH,
      role: "rescue",
      emailVerified: true,
      district: "Limassol",
    },
    update: {},
  });

  await prisma.rescueOrg.upsert({
    where: { userId: rescueUser.id },
    create: {
      userId: rescueUser.id,
      name: "Paws of Cyprus",
      mission: "Rescuing and rehoming abandoned dogs and cats across Cyprus.",
      location: "Limassol, Cyprus",
      website: "https://pawsofcyprus.org",
      slug: "paws-of-cyprus-rescue",
      verified: true,
    },
    update: {},
  });

  // ----- 3b. Gardens of St Gertrude rescue org + real cat listings -----
  let gardensOrg = await prisma.rescueOrg.findUnique({
    where: { slug: GARDENS_ORG_SLUG },
  });
  if (!gardensOrg) {
    const gardensUser = await prisma.user.upsert({
      where: { email: "gardens-rescue@test.tinies.app" },
      create: {
        email: "gardens-rescue@test.tinies.app",
        name: "Gardens of St Gertrude",
        passwordHash: TEST_PASSWORD_HASH,
        role: "rescue",
        emailVerified: true,
        district: "Limassol",
      },
      update: { name: "Gardens of St Gertrude" },
    });
    gardensOrg = await prisma.rescueOrg.create({
      data: {
        userId: gardensUser.id,
        name: "Gardens of St Gertrude",
        mission:
          "Since 2017, founders have invested EUR 460,000+ in rescue across Cyprus — 92 cats in daily sanctuary care, 160+ spayed/neutered, and vet support for other rescues.",
        location: "Parekklisia, Cyprus",
        website: "https://gardensofstgertrude.com",
        slug: GARDENS_ORG_SLUG,
        verified: true,
      },
    });
  }

  await prisma.charity.updateMany({
    where: { slug: "gardens-of-st-gertrude" },
    data: { rescueOrgId: gardensOrg.id },
  });

  gardensOrg = await prisma.rescueOrg.update({
    where: { id: gardensOrg.id },
    data: {
      description:
        "Gardens of St Gertrude is a cat sanctuary in Parekklisia, Cyprus, caring for 92 rescue cats every day. Since 2017, the founders have personally invested over EUR 460,000 in animal rescue across Cyprus — funding veterinary care, spay/neuter programs, emergency surgeries, and daily feeding not only for the 92 cats at Gardens of St Gertrude, but for other rescue organisations who needed help with vet bills they couldn't cover. Every cat here has a name, a story, and a warm place to sleep. The sanctuary is open to visitors and always needs volunteers and donations to keep going.",
      foundedYear: 2017,
      operatingHours: "Open to visitors daily, 9am-1pm",
      volunteerInfo:
        "We welcome volunteers for morning feeding (8am-10am) and afternoon socialisation (2pm-4pm). Contact us to arrange a visit.",
      donationNeeds:
        "We always need: dry and wet cat food, flea and tick treatments, cat litter, blankets, and funds for veterinary emergencies.",
      totalAnimalsRescued: 160,
      contactEmail: "hello@tinies.app",
      district: "Limassol",
      coverPhotoUrl: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg",
    },
  });

  for (const cat of GARDENS_CATS) {
    const sameName = await prisma.adoptionListing.findMany({
      where: { orgId: gardensOrg.id, name: cat.name },
      orderBy: { createdAt: "asc" },
      select: { id: true, slug: true },
    });
    if (sameName.length > 1) {
      await prisma.adoptionListing.deleteMany({
        where: { id: { in: sameName.slice(1).map((r) => r.id) } },
      });
    }
    const baseSlug = slugify(cat.name);
    const slug = sameName[0]?.slug ?? (await ensureUniqueListingSlug(baseSlug));
    // Same payload on create + update so re-seeding refreshes every seeded column (including rich-profile fields).
    const listingBody = {
      orgId: gardensOrg.id,
      name: cat.name,
      alternateNames: [...(cat.alternateNames ?? [])],
      nameStory: cat.nameStory ?? null,
      species: "cat",
      breed: cat.breed,
      estimatedAge: cat.estimatedAge,
      sex: cat.sex,
      spayedNeutered: true,
      temperament: cat.temperament,
      medicalHistory: cat.medicalHistory,
      specialNeeds: cat.specialNeeds,
      backstory: cat.backstory,
      personality: cat.personality,
      idealHome: cat.idealHome ?? null,
      goodWith: [...cat.goodWith],
      notGoodWith: [...cat.notGoodWith],
      videoUrl: cat.videoUrl ?? null,
      fosterLocation: cat.fosterLocation,
      lineageTitle: cat.lineageTitle ?? null,
      motherId: null as string | null,
      fatherId: null as string | null,
      motherName: cat.motherName ?? null,
      fatherName: cat.fatherName ?? null,
      siblingIds: [] as string[],
      familyNotes: cat.familyNotes ?? null,
      internationalEligible: true,
      destinationCountries: [...GARDENS_DESTINATIONS],
      photos: [cat.photo],
      status: cat.memorial ? AdoptionListingStatus.memorial : AdoptionListingStatus.available,
      active: true,
    };
    await prisma.adoptionListing.upsert({
      where: { slug },
      create: { ...listingBody, slug },
      update: listingBody,
    });
  }

  const ziggyRow = await prisma.adoptionListing.findFirst({
    where: { orgId: gardensOrg.id, name: "Ziggy" },
    select: { id: true },
  });
  const splotchRow = await prisma.adoptionListing.findFirst({
    where: { orgId: gardensOrg.id, name: "Splotch" },
    select: { id: true },
  });
  if (ziggyRow && splotchRow) {
    await prisma.adoptionListing.update({
      where: { id: ziggyRow.id },
      data: { siblingIds: [splotchRow.id] },
    });
    await prisma.adoptionListing.update({
      where: { id: splotchRow.id },
      data: { siblingIds: [ziggyRow.id] },
    });
  }

  const safeLandMilestones = [
    {
      title: "Campaign launched",
      description: "Telling our story and rallying support",
      targetCents: null,
      reached: true,
      reachedAt: "2026-03-22",
    },
    {
      title: "Research phase",
      description: "Identifying suitable land in the Limassol district",
      targetCents: null,
      reached: false,
    },
    {
      title: "Land identified",
      description: "Found the right piece of land for our cats",
      targetCents: null,
      reached: false,
    },
    {
      title: "Legal and permits",
      description: "Zoning verification and purchase preparation",
      targetCents: null,
      reached: false,
    },
    {
      title: "Land secured",
      description: "Purchase or lease signed",
      targetCents: null,
      reached: false,
    },
    {
      title: "Sanctuary built",
      description: "Enclosures, shelters, and garden spaces ready",
      targetCents: null,
      reached: false,
    },
    {
      title: "92 cats relocated",
      description: "Every cat safe in their new home",
      targetCents: null,
      reached: false,
    },
  ];

  const safeLandDescription =
    "Gardens of St Gertrude cares for 92 rescue cats in Parekklisia, Cyprus. These cats were abandoned, injured, or born on the streets. We gave them a home — food, vet care, shelter, love.\n\nBut they need more than a home. They need a safe one.\n\nWe're searching for land where we can build a proper sanctuary — open garden spaces for the cats to roam, secure enclosures so they're protected, room to grow as we rescue more animals. A place where every cat has space, safety, and a future.\n\nYour donation goes directly to the land fund. Every euro is tracked on our transparency page. When we find the right piece of land, you'll be the first to know.\n\n92 cats are counting on us. And we're counting on you.";

  await prisma.campaign.upsert({
    where: { slug: "safe-land-for-92-cats" },
    create: {
      rescueOrgId: gardensOrg.id,
      slug: "safe-land-for-92-cats",
      title: "Safe Land for 92 Cats",
      subtitle: "Help us find and secure safe land where our cats can live without fear.",
      description: safeLandDescription,
      coverPhotoUrl: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg",
      goalAmountCents: null,
      raisedAmountCents: 0,
      donorCount: 0,
      status: "active",
      featured: true,
      milestones: safeLandMilestones,
      updates: [],
    },
    update: {
      title: "Safe Land for 92 Cats",
      subtitle: "Help us find and secure safe land where our cats can live without fear.",
      description: safeLandDescription,
      coverPhotoUrl: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg",
      goalAmountCents: null,
      status: "active",
      featured: true,
      milestones: safeLandMilestones,
    },
  });

  console.log("Ensured Gardens of St Gertrude org, 6 cat adoption listings, Safe Land campaign, and charity link.");

  // ----- 3c. Patch of Heaven Animal Haven (showcase + campaign; no listings yet) -----
  const PATCH_ORG_SLUG = "patch-of-heaven";
  const patchUser = await prisma.user.upsert({
    where: { email: "marina@patchofheavencats.com" },
    create: {
      email: "marina@patchofheavencats.com",
      name: "Marina Niaou",
      passwordHash: TEST_PASSWORD_HASH,
      role: "rescue",
      emailVerified: true,
      district: "Limassol",
    },
    update: { name: "Marina Niaou", district: "Limassol" },
  });

  const patchDescription =
    "Patch of Heaven Animal Haven was built to give sanctuary to cats who had nowhere else to go. Founded by Marina Niaou and her husband, the haven began when they relocated stray and feral cats from a colony in a Limassol graveyard — cats that were living in terrible conditions with no one to care for them. Today, Patch of Heaven cares for over 100 cats on site, plus manages outside feeding colonies. Every cat here — whether senior, disabled, abused, or simply unwanted — has a name, daily meals, veterinary care, and a safe place to sleep. The haven runs entirely on donations and volunteer support.";

  let patchOrg = await prisma.rescueOrg.upsert({
    where: { slug: PATCH_ORG_SLUG },
    create: {
      userId: patchUser.id,
      name: "Patch of Heaven Animal Haven",
      mission: "A safe home for abused, abandoned, senior, and disabled cats in Limassol.",
      description: patchDescription,
      location: "Limassol, Cyprus",
      district: "Limassol",
      website: "https://patchofheavencats.com",
      slug: PATCH_ORG_SLUG,
      verified: true,
      socialLinks: { facebook: "https://www.facebook.com/PoHDiamonds/" },
      totalAnimalsRescued: 100,
      donationNeeds:
        "We always need: cat food (wet and dry), flea and tick treatments, cat litter, blankets, towels, and funds for veterinary care and emergency surgeries.",
      volunteerInfo:
        "We welcome volunteers for daily feeding, cleaning, and cat socialisation. Contact us through our Facebook page to arrange a visit.",
      contactEmail: "marina@patchofheavencats.com",
      coverPhotoUrl: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg",
    },
    update: {
      name: "Patch of Heaven Animal Haven",
      mission: "A safe home for abused, abandoned, senior, and disabled cats in Limassol.",
      description: patchDescription,
      location: "Limassol, Cyprus",
      district: "Limassol",
      website: "https://patchofheavencats.com",
      verified: true,
      socialLinks: { facebook: "https://www.facebook.com/PoHDiamonds/" },
      totalAnimalsRescued: 100,
      donationNeeds:
        "We always need: cat food (wet and dry), flea and tick treatments, cat litter, blankets, towels, and funds for veterinary care and emergency surgeries.",
      volunteerInfo:
        "We welcome volunteers for daily feeding, cleaning, and cat socialisation. Contact us through our Facebook page to arrange a visit.",
      contactEmail: "marina@patchofheavencats.com",
      coverPhotoUrl: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg",
    },
  });

  if (patchOrg.userId !== patchUser.id) {
    patchOrg = await prisma.rescueOrg.update({
      where: { id: patchOrg.id },
      data: { userId: patchUser.id },
    });
  }

  await prisma.charity.updateMany({
    where: { slug: PATCH_ORG_SLUG },
    data: { rescueOrgId: patchOrg.id },
  });

  const patchCampaignDescription =
    "Patch of Heaven cares for over 100 rescue cats in Limassol — cats rescued from graveyards, streets, and abandonment. Every month costs real money: food, litter, flea treatments, emergency vet visits. Marina and her husband built this haven with their own hands and their own money. Now they need the community's help to keep it going.\n\nYour donation goes directly to daily care:\n- EUR 3 feeds one cat for a week\n- EUR 15 covers flea treatment for five cats\n- EUR 50 pays for an emergency vet visit\n- EUR 100 feeds the entire haven for three days\n\nEvery euro is tracked on the Tinies transparency page. These cats depend on people like you.";

  const patchMilestones = [
    {
      title: "Campaign launched",
      description: "Telling the Patch of Heaven story",
      targetCents: null,
      reached: true,
      reachedAt: "2026-03-22",
    },
    {
      title: "First 10 supporters",
      description: "Building the community",
      targetCents: null,
      reached: false,
    },
    {
      title: "Monthly food costs covered",
      description: "Sustainable monthly feeding for 100+ cats",
      targetCents: null,
      reached: false,
    },
    {
      title: "Emergency vet fund established",
      description: "EUR 500 reserve for unexpected medical emergencies",
      targetCents: null,
      reached: false,
    },
  ];

  await prisma.campaign.upsert({
    where: { slug: "keep-100-cats-fed" },
    create: {
      rescueOrgId: patchOrg.id,
      slug: "keep-100-cats-fed",
      title: "Keep 100 Cats Fed and Safe",
      subtitle: "Food, litter, and vet care for 100+ cats at Patch of Heaven.",
      description: patchCampaignDescription,
      coverPhotoUrl: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg",
      goalAmountCents: 500_000,
      raisedAmountCents: 0,
      donorCount: 0,
      status: "active",
      featured: true,
      milestones: patchMilestones,
      updates: [],
    },
    update: {
      title: "Keep 100 Cats Fed and Safe",
      subtitle: "Food, litter, and vet care for 100+ cats at Patch of Heaven.",
      description: patchCampaignDescription,
      coverPhotoUrl: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg",
      goalAmountCents: 500_000,
      status: "active",
      featured: true,
      milestones: patchMilestones,
    },
  });

  console.log("Ensured Patch of Heaven Animal Haven, linked charity, and Keep 100 Cats Fed campaign.");

  // ----- 4. Owner user + pets (for bookings and reviews) -----
  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@test.tinies.app" },
    create: {
      email: "owner@test.tinies.app",
      name: "Christina Ioannou",
      passwordHash: TEST_PASSWORD_HASH,
      role: "owner",
      emailVerified: true,
      district: "Limassol",
    },
    update: {},
  });

  const pet1 = await prisma.pet.upsert({
    where: { id: "seed-pet-1" },
    create: {
      id: "seed-pet-1",
      ownerId: ownerUser.id,
      name: "Roxy",
      species: "dog",
      breed: "Labrador",
      ageYears: 3,
      weightKg: 28,
      sex: "female",
      spayedNeutered: true,
      temperament: "Friendly, loves walks",
      photos: [],
    },
    update: {},
  });

  const pet2 = await prisma.pet.upsert({
    where: { id: "seed-pet-2" },
    create: {
      id: "seed-pet-2",
      ownerId: ownerUser.id,
      name: "Leo",
      species: "cat",
      breed: "Maine Coon mix",
      ageYears: 2,
      photos: [],
    },
    update: {},
  });

  // ----- 5. Completed bookings (so we can attach reviews) -----
  const now = new Date();
  const pastStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const pastEnd = new Date(pastStart.getTime() + 2 * 60 * 60 * 1000);

  const booking1 = await prisma.booking.upsert({
    where: { id: "seed-booking-1" },
    create: {
      id: "seed-booking-1",
      ownerId: ownerUser.id,
      providerId: providerUserIds[0],
      petIds: [pet1.id],
      serviceType: "walking",
      startDatetime: pastStart,
      endDatetime: pastEnd,
      status: "completed",
      totalPrice: 1500,
      commissionAmount: 180,
    },
    update: { status: "completed" },
  });

  const booking2 = await prisma.booking.upsert({
    where: { id: "seed-booking-2" },
    create: {
      id: "seed-booking-2",
      ownerId: ownerUser.id,
      providerId: providerUserIds[1],
      petIds: [pet1.id],
      serviceType: "boarding",
      startDatetime: pastStart,
      endDatetime: new Date(pastStart.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: "completed",
      totalPrice: 3500,
      commissionAmount: 420,
    },
    update: { status: "completed" },
  });

  const booking3 = await prisma.booking.upsert({
    where: { id: "seed-booking-3" },
    create: {
      id: "seed-booking-3",
      ownerId: ownerUser.id,
      providerId: providerUserIds[2],
      petIds: [pet2.id],
      serviceType: "drop_in",
      startDatetime: pastStart,
      endDatetime: pastEnd,
      status: "completed",
      totalPrice: 1200,
      commissionAmount: 144,
    },
    update: { status: "completed" },
  });

  const booking4 = await prisma.booking.upsert({
    where: { id: "seed-booking-4" },
    create: {
      id: "seed-booking-4",
      ownerId: ownerUser.id,
      providerId: providerUserIds[3],
      petIds: [pet1.id],
      serviceType: "walking",
      startDatetime: new Date(pastStart.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDatetime: new Date(pastStart.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: "completed",
      totalPrice: 1200,
      commissionAmount: 144,
    },
    update: { status: "completed" },
  });

  const booking5 = await prisma.booking.upsert({
    where: { id: "seed-booking-5" },
    create: {
      id: "seed-booking-5",
      ownerId: ownerUser.id,
      providerId: providerUserIds[4],
      petIds: [pet1.id, pet2.id],
      serviceType: "sitting",
      startDatetime: pastStart,
      endDatetime: new Date(pastStart.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: "completed",
      totalPrice: 4200,
      commissionAmount: 504,
    },
    update: { status: "completed" },
  });

  const booking6 = await prisma.booking.upsert({
    where: { id: "seed-booking-6" },
    create: {
      id: "seed-booking-6",
      ownerId: ownerUser.id,
      providerId: providerUserIds[5],
      petIds: [pet1.id],
      serviceType: "walking",
      startDatetime: new Date(pastStart.getTime() - 14 * 24 * 60 * 60 * 1000),
      endDatetime: new Date(pastStart.getTime() - 14 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      status: "completed",
      totalPrice: 1400,
      commissionAmount: 168,
    },
    update: { status: "completed", providerId: providerUserIds[5] },
  });

  const bookings = [booking1, booking2, booking3, booking4, booking5, booking6];

  // ----- 6. Reviews -----
  for (let i = 0; i < REVIEW_TEXTS.length; i++) {
    const r = REVIEW_TEXTS[i];
    const booking = bookings[i];
    await prisma.review.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        reviewerId: ownerUser.id,
        providerId: booking.providerId,
        rating: r.rating,
        text: r.text,
        photos: [],
      },
      update: { rating: r.rating, text: r.text },
    });
  }

  // Update provider review counts and avg rating
  for (let i = 0; i < providerUserIds.length; i++) {
    const uid = providerUserIds[i];
    const reviews = await prisma.review.findMany({ where: { providerId: uid }, select: { rating: true } });
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : null;
    await prisma.providerProfile.update({
      where: { userId: uid },
      data: { reviewCount: count, avgRating: avg ?? undefined },
    });
  }
  console.log("Created 6 completed bookings and 6 reviews.");

  await seedTrainingCourses(prisma);
  await certifyAllProvidersForRequiredCourses(prisma);

  await seedSiteImages(prisma);

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * Tinies database seed — realistic test data for Cyprus.
 * Run: npx tsx prisma/seed.ts   (or: npx prisma db seed)
 * Ensure migrations are applied first: npx prisma migrate deploy
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

// ---------------------------------------------------------------------------
// 1. Five service providers (User + ProviderProfile)
// ---------------------------------------------------------------------------

const PROVIDERS = [
  {
    name: "Maria Georgiou",
    email: "maria@test.tinies.app",
    slug: "maria-georgiou",
    district: "Limassol",
    bio: "I've loved animals my whole life. Five years of experience walking and sitting for dogs and cats in Limassol. I work from home and have a calm, friendly environment. Happy to send photo updates and follow any care instructions. I only take a few clients at a time so your pet gets plenty of attention.",
    lat: 34.6786,
    lng: 33.0413,
    homeType: "house",
    hasYard: true,
    yardFenced: true,
    services: [
      { type: "walking", base_price: 1500, additional_pet_price: 800, price_unit: "per_visit", max_pets: 3 },
      { type: "sitting", base_price: 2500, additional_pet_price: 1000, price_unit: "per_day", max_pets: 2 },
    ],
  },
  {
    name: "Andreas Christou",
    email: "andreas@test.tinies.app",
    slug: "andreas-christou",
    district: "Nicosia",
    bio: "Large garden and years of experience with big dogs. I offer boarding and daycare in a safe, spacious home in Nicosia. All dogs get supervised playtime and plenty of shade. I can administer medication and stick to any feeding schedule.",
    lat: 35.1856,
    lng: 33.3823,
    homeType: "house",
    hasYard: true,
    yardFenced: true,
    services: [
      { type: "boarding", base_price: 3500, additional_pet_price: 1500, price_unit: "per_night", max_pets: 2 },
      { type: "daycare", base_price: 2000, additional_pet_price: 800, price_unit: "per_day", max_pets: 3 },
    ],
  },
  {
    name: "Elena Pavlou",
    email: "elena@test.tinies.app",
    slug: "elena-pavlou",
    district: "Paphos",
    bio: "I specialise in cats. Drop-in visits and cat sitting in Paphos. I know how stressful it is to leave your cat at home — I'll keep their routine, play with them, and send you updates. Medication and special diets no problem.",
    lat: 34.7754,
    lng: 32.4218,
    homeType: "apartment",
    hasYard: false,
    yardFenced: false,
    services: [
      { type: "drop_in", base_price: 1200, additional_pet_price: 500, price_unit: "per_visit", max_pets: 4 },
      { type: "sitting", base_price: 2000, additional_pet_price: 800, price_unit: "per_day", max_pets: 2 },
    ],
  },
  {
    name: "Nikos Demetriou",
    email: "nikos@test.tinies.app",
    slug: "nikos-demetriou",
    district: "Larnaca",
    bio: "Active lifestyle and beach walks. I offer dog walking and boarding in Larnaca. Your dog will get plenty of exercise and company. Fenced yard for safe off-lead time. Great with high-energy breeds.",
    lat: 34.9229,
    lng: 33.6233,
    homeType: "house",
    hasYard: true,
    yardFenced: true,
    services: [
      { type: "walking", base_price: 1200, additional_pet_price: 600, price_unit: "per_visit", max_pets: 3 },
      { type: "boarding", base_price: 3000, additional_pet_price: 1200, price_unit: "per_night", max_pets: 2 },
    ],
  },
  {
    name: "Sophie Williams",
    email: "sophie@test.tinies.app",
    slug: "sophie-williams",
    district: "Limassol",
    bio: "British expat, professional pet care. I offer all services in Limassol — walking, sitting, boarding, drop-ins, and daycare. Large garden, calm home, and years of experience with dogs and cats. Fully insured and dedicated to your pet's comfort.",
    lat: 34.6786,
    lng: 33.0413,
    homeType: "house",
    hasYard: true,
    yardFenced: true,
    services: [
      { type: "walking", base_price: 1800, additional_pet_price: 900, price_unit: "per_visit", max_pets: 3 },
      { type: "sitting", base_price: 3000, additional_pet_price: 1200, price_unit: "per_day", max_pets: 2 },
      { type: "boarding", base_price: 4000, additional_pet_price: 1500, price_unit: "per_night", max_pets: 2 },
      { type: "drop_in", base_price: 1500, additional_pet_price: 600, price_unit: "per_visit", max_pets: 4 },
      { type: "daycare", base_price: 2500, additional_pet_price: 1000, price_unit: "per_day", max_pets: 3 },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. Three charities
// ---------------------------------------------------------------------------

const CHARITIES = [
  {
    name: "Gardens of St Gertrude",
    slug: "gardens-of-st-gertrude",
    mission: "Caring for 92 rescue cats in Parekklisia, Cyprus. Every cat deserves safety, food, and love.",
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
];

// ---------------------------------------------------------------------------
// 3. Gardens of St Gertrude — real cat listings (GitHub-hosted photos)
// ---------------------------------------------------------------------------

const GARDENS_ORG_SLUG = "gardens-of-st-gertrude";
const GARDENS_DESTINATIONS = ["UK", "Germany", "Netherlands", "Sweden", "Austria", "Switzerland"];

type GardensCatSeed = {
  name: string;
  breed: string;
  sex: string;
  estimatedAge: string;
  temperament: string;
  medicalHistory: string | null;
  specialNeeds: string | null;
  backstory: string;
  personality: string;
  idealHome: string;
  goodWith: string[];
  notGoodWith: string[];
  fosterLocation: string;
  photo: string;
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
  },
  {
    name: "Oliver",
    breed: "Domestic Shorthair",
    sex: "male",
    estimatedAge: "5 years",
    temperament: "Resilient, affectionate, gentle lap cat",
    medicalHistory: "Hit by a car near Parekklisia; pelvic fracture, surgery, and three months' recovery — now fully mobile per vet.",
    specialNeeds: "Recovered from pelvic surgery. Occasional vet checkups recommended.",
    backstory:
      "Oliver was hit by a car on the highway near Parekklisia. His pelvis was shattered. After surgery and three months of recovery at the sanctuary, he made a full recovery.",
    personality:
      "Despite everything, Oliver is the most affectionate cat here. He'll curl up in your lap and purr for hours. Resilient and gentle.",
    idealHome:
      "A calm, indoor home. Oliver shouldn't be near busy roads again. He needs a quiet space where he feels safe.",
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
  { rating: 5, text: "Maria was fantastic. Our dog came back happy and tired. She sent photos during the walk and was very professional. Will definitely book again." },
  { rating: 5, text: "Andreas looked after our two dogs for a week. His garden is perfect for them and he kept us updated every day. Couldn't ask for more." },
  { rating: 4, text: "Elena was great with our cat. She followed all our instructions and left the flat spotless. Our cat was relaxed when we got home." },
  { rating: 5, text: "Nikos took our dog on amazing beach walks. You can tell he really cares. Highly recommend for active dogs." },
  { rating: 5, text: "Sophie is a total pro. She did a meet-and-greet first and put us at ease. Our dog had a brilliant time at her place." },
  { rating: 4, text: "Very reliable and kind. Maria was flexible with timing when our flight was delayed. Thank you!" },
];

async function main() {
  console.log("Seeding Tinies database (Cyprus test data)...\n");

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
      },
    });
  }
  console.log("Created 5 provider users and profiles.");

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
  console.log("Created 3 charities.");

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
        mission: "Caring for 92 rescue cats in Parekklisia, Cyprus. Every cat deserves safety, food, and love.",
        location: "Parekklisia, Cyprus",
        website: "https://gardensofstgertrude.com",
        slug: GARDENS_ORG_SLUG,
        verified: true,
      },
    });
  }

  for (const cat of GARDENS_CATS) {
    const baseSlug = slugify(cat.name);
    const slug = await ensureUniqueListingSlug(baseSlug);
    const listingBody = {
      orgId: gardensOrg.id,
      name: cat.name,
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
      idealHome: cat.idealHome,
      goodWith: cat.goodWith,
      notGoodWith: cat.notGoodWith,
      fosterLocation: cat.fosterLocation,
      internationalEligible: true,
      destinationCountries: [...GARDENS_DESTINATIONS],
      photos: [cat.photo],
      status: "available" as const,
      active: true,
    };
    await prisma.adoptionListing.upsert({
      where: { slug },
      create: { ...listingBody, slug },
      update: listingBody,
    });
  }
  console.log("Ensured Gardens of St Gertrude org and 6 cat adoption listings with rich profiles.");

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
      providerId: providerUserIds[0],
      petIds: [pet1.id],
      serviceType: "walking",
      startDatetime: new Date(pastStart.getTime() - 14 * 24 * 60 * 60 * 1000),
      endDatetime: new Date(pastStart.getTime() - 14 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      status: "completed",
      totalPrice: 1500,
      commissionAmount: 180,
    },
    update: { status: "completed" },
  });

  const bookings = [booking1, booking2, booking3, booking4, booking5, booking6];
  const providerIdsForReviews = [providerUserIds[0], providerUserIds[1], providerUserIds[2], providerUserIds[3], providerUserIds[4], providerUserIds[0]];

  // ----- 6. Reviews -----
  for (let i = 0; i < REVIEW_TEXTS.length; i++) {
    const r = REVIEW_TEXTS[i];
    const booking = bookings[i];
    const providerId = providerIdsForReviews[i];
    await prisma.review.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        reviewerId: ownerUser.id,
        providerId,
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

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

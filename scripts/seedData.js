const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
require("dotenv").config({ path: "./config.env" });

// Sample data for seeding
const sampleUsers = [
  {
    username: "GlobeTrotterGia",
    email: "giatraveler@example.com",
    password: "password123",
    bio: "Exploring the world one POI at a time 🌍✈️",
    profilePicture: null,
  },
  {
    username: "PixelPete",
    email: "pixelpete@example.com",
    password: "password123",
    bio: "Capturing moments around the globe 📸",
    profilePicture: null,
  },
  {
    username: "WanderlustWill",
    email: "wanderlustwill@example.com",
    password: "password123",
    bio: "Adventure awaits! 🏔️",
    profilePicture: null,
  },
  {
    username: "CityScaper",
    email: "cityscaper@example.com",
    password: "password123",
    bio: "Urban adventures and hidden gems 🏙️",
    profilePicture: null,
  },
  {
    username: "HistoricHarry",
    email: "historicharry@example.com",
    password: "password123",
    bio: "Preserving memories of historical places 📚",
    profilePicture: null,
  },
  {
    username: "TrailblazerTina",
    email: "trailblazertina@example.com",
    password: "password123",
    bio: "Blazing trails across continents 🌍",
    profilePicture: null,
  },
  {
    username: "AnnaAdventures",
    email: "annaadventures@example.com",
    password: "password123",
    bio: "Adventure is out there! 🗺️",
    profilePicture: null,
  },
  {
    username: "LeoLens",
    email: "leolens@example.com",
    password: "password123",
    bio: "Through the lens of travel 📷",
    profilePicture: null,
  },
  {
    username: "SafariSue",
    email: "safarisue@example.com",
    password: "password123",
    bio: "Wild adventures and ancient wonders 🦁",
    profilePicture: null,
  },
  {
    username: "MountainMike",
    email: "mountainmike@example.com",
    password: "password123",
    bio: "Reaching new heights 🏔️",
    profilePicture: null,
  },
  {
    username: "CultureClara",
    email: "cultureclara@example.com",
    password: "password123",
    bio: "Immersing in cultures worldwide 🌏",
    profilePicture: null,
  },
  {
    username: "UrbanExplorer",
    email: "urbanexplorer@example.com",
    password: "password123",
    bio: "Exploring cityscapes and landmarks 🏛️",
    profilePicture: null,
  },
  {
    username: "ViewfinderVicky",
    email: "viewfindervicky@example.com",
    password: "password123",
    bio: "Finding beauty through my viewfinder 📸",
    profilePicture: null,
  },
  {
    username: "PassportPaul",
    email: "passportpaul@example.com",
    password: "password123",
    bio: "Passport stamps and memories ✈️",
    profilePicture: null,
  },
  {
    username: "RoverRick",
    email: "roverrick@example.com",
    password: "password123",
    bio: "Roaming the world one destination at a time 🗺️",
    profilePicture: null,
  },
  {
    username: "IslaInspired",
    email: "islainspired@example.com",
    password: "password123",
    bio: "Inspired by islands and remote places 🏝️",
    profilePicture: null,
  },
  {
    username: "TrekkerTom",
    email: "trekkertom@example.com",
    password: "password123",
    bio: "Trekking through nature's wonders 🥾",
    profilePicture: null,
  },
  {
    username: "NomadNina",
    email: "nomadnina@example.com",
    password: "password123",
    bio: "Digital nomad exploring the world 💻",
    profilePicture: null,
  },
  {
    username: "JourneyJen",
    email: "journeyjen@example.com",
    password: "password123",
    bio: "Every journey tells a story 📖",
    profilePicture: null,
  },
  {
    username: "ExplorerEd",
    email: "explorered@example.com",
    password: "password123",
    bio: "Exploring the world's greatest landmarks 🗽",
    profilePicture: null,
  },
];

const samplePosts = [
  {
    username: "GlobeTrotterGia",
    caption:
      "Touching the sky in Dubai! The view from the Burj Khalifa is absolutely unreal. 🏙️ #Dubai #BurjKhalifa #Travel",
    location: { name: "Burj Khalifa, Dubai" },
    timestamp: "2025-09-19T22:15:00Z",
  },
  {
    username: "PixelPete",
    caption:
      "Classic view of the Tokyo Tower at night. The city's energy is electric! 🗼 #Tokyo #Japan #Nightlife",
    location: { name: "Tokyo Tower, Japan" },
    timestamp: "2025-09-19T18:45:10Z",
  },
  {
    username: "WanderlustWill",
    caption:
      "Hiked all the way up for this moment. Worth every step. Machu Picchu is pure magic. ✨ #Peru #MachuPicchu #IncaTrail",
    location: { name: "Machu Picchu, Peru" },
    timestamp: "2025-09-19T11:20:30Z",
  },
  {
    username: "CityScaper",
    caption:
      "An architectural marvel. The Sydney Opera House against a perfect blue sky. #Sydney #Australia #Architecture",
    location: { name: "Sydney Opera House, Australia" },
    timestamp: "2025-09-18T20:05:00Z",
  },
  {
    username: "HistoricHarry",
    caption:
      "Standing in the Colosseum, you can almost hear the echoes of history. Truly awe-inspiring. #Rome #Italy #History",
    location: { name: "Colosseum, Rome" },
    timestamp: "2025-09-18T15:30:55Z",
  },
  {
    username: "TrailblazerTina",
    caption:
      "Walking on the Great Wall of China. It just goes on forever! An unforgettable experience. #China #GreatWall #WonderOfTheWorld",
    location: { name: "Great Wall of China" },
    timestamp: "2025-09-18T09:10:00Z",
  },
  {
    username: "AnnaAdventures",
    caption:
      "The Treasury at Petra, revealed after walking through the Siq. Felt like I was in a movie! #Petra #Jordan #AncientCity",
    location: { name: "Petra, Jordan" },
    timestamp: "2025-09-17T19:55:12Z",
  },
  {
    username: "LeoLens",
    caption:
      "Parisian nights and sparkling lights. The Eiffel Tower never disappoints. 낭만적! ❤️ #Paris #France #EiffelTower",
    location: { name: "Eiffel Tower, Paris" },
    timestamp: "2025-09-17T12:00:00Z",
  },
  {
    username: "SafariSue",
    caption:
      "Gazing at the Pyramids of Giza. How did they build these?! Mind-blowing. 🤯 #Egypt #Giza #AncientEgypt",
    location: { name: "Pyramids of Giza, Egypt" },
    timestamp: "2025-09-16T17:40:20Z",
  },
  {
    username: "MountainMike",
    caption:
      "Christ the Redeemer watching over Rio de Janeiro. The panoramic views are breathtaking. #Rio #Brazil #TravelGoals",
    location: { name: "Christ the Redeemer, Rio de Janeiro" },
    timestamp: "2025-09-16T10:25:00Z",
  },
  {
    username: "CultureClara",
    caption:
      "The Taj Mahal at sunrise. A truly breathtaking monument to love. So serene and beautiful. #India #Agra #TajMahal",
    location: { name: "Taj Mahal, India" },
    timestamp: "2025-09-15T08:15:45Z",
  },
  {
    username: "UrbanExplorer",
    caption:
      "Hello, Lady Liberty! A symbol of freedom recognized all over the world. #NYC #NewYork #USA",
    location: { name: "Statue of Liberty, New York" },
    timestamp: "2025-09-15T02:30:00Z",
  },
  {
    username: "ViewfinderVicky",
    caption:
      "The Parthenon standing tall on the Acropolis. So much history in one place. #Athens #Greece #AncientGreece",
    location: { name: "Acropolis, Athens" },
    timestamp: "2025-09-14T16:00:15Z",
  },
  {
    username: "PassportPaul",
    caption:
      "A real-life fairytale castle! Neuschwanstein Castle in Germany is straight out of a storybook. 🏰 #Germany #Bavaria #Castle",
    location: { name: "Neuschwanstein Castle, Germany" },
    timestamp: "2025-09-14T11:50:00Z",
  },
  {
    username: "RoverRick",
    caption:
      "The mystery of Stonehenge. It's wild to think about how long these stones have been standing here. #UK #England #Stonehenge",
    location: { name: "Stonehenge, England" },
    timestamp: "2025-09-13T14:22:33Z",
  },
  {
    username: "IslaInspired",
    caption:
      "The enigmatic Moai of Easter Island. So remote and so fascinating. #EasterIsland #Chile #RapaNui",
    location: { name: "Easter Island, Chile" },
    timestamp: "2025-09-13T09:00:00Z",
  },
  {
    username: "TrekkerTom",
    caption:
      "The sheer scale of the Grand Canyon is impossible to capture in a photo. You have to see it to believe it. #Arizona #USA #NationalPark",
    location: { name: "Grand Canyon, Arizona" },
    timestamp: "2025-09-12T21:35:10Z",
  },
  {
    username: "NomadNina",
    caption:
      "The colourful domes of St. Basil's Cathedral in Moscow's Red Square. So unique! #Moscow #Russia #Architecture",
    location: { name: "St. Basil's Cathedral, Moscow" },
    timestamp: "2025-09-12T13:13:13Z",
  },
  {
    username: "JourneyJen",
    caption:
      "Exploring the ancient temples of Angkor Wat in Cambodia at dawn. A spiritual and humbling experience. #Cambodia #SiemReap #AngkorWat",
    location: { name: "Angkor Wat, Cambodia" },
    timestamp: "2025-09-11T07:07:07Z",
  },
  {
    username: "ExplorerEd",
    caption:
      "Classic shot of the Golden Gate Bridge on a rare clear day. What an icon! #SanFrancisco #California #Bridge",
    location: { name: "Golden Gate Bridge, San Francisco" },
    timestamp: "2025-09-10T18:00:00Z",
  },
];

// Sample image URLs - using reliable image sources
const sampleImages = [
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1544966503-7cc4ac81b4c4?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&crop=center",
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/vistagram"
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`👤 Created user: ${user.username}`);
    }

    // Create posts with matching users and interactions
    const posts = [];
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      // Find the user that matches the post username
      const postUser = users.find(
        (user) => user.username === postData.username
      );

      if (!postUser) {
        console.log(`User not found for post: ${postData.username}`);
        continue;
      }

      const post = new Post({
        user: postUser._id,
        image: sampleImages[i],
        caption: postData.caption,
        location: postData.location,
        createdAt: new Date(postData.timestamp),
      });

      // Add random likes
      const numLikes = Math.floor(Math.random() * 20) + 1;
      for (let j = 0; j < numLikes; j++) {
        const randomLiker = users[Math.floor(Math.random() * users.length)];
        if (
          !post.likes.some(
            (like) => like.user.toString() === randomLiker._id.toString()
          )
        ) {
          post.likes.push({
            user: randomLiker._id,
            likedAt: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ),
          });
        }
      }

      // Add random shares
      const numShares = Math.floor(Math.random() * 10);
      for (let j = 0; j < numShares; j++) {
        const randomSharer = users[Math.floor(Math.random() * users.length)];
        if (
          !post.shares.some(
            (share) => share.user.toString() === randomSharer._id.toString()
          )
        ) {
          post.shares.push({
            user: randomSharer._id,
            sharedAt: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ),
          });
        }
      }

      // Add random comments
      const numComments = Math.floor(Math.random() * 5);
      const sampleComments = [
        "Amazing shot! 📸",
        "I need to visit this place!",
        "Beautiful! 😍",
        "Great find!",
        "Love this spot!",
        "Incredible view!",
        "Perfect timing!",
        "This is stunning!",
        "Adding to my bucket list!",
        "Wow! 🤩",
      ];

      for (let j = 0; j < numComments; j++) {
        const randomCommenter = users[Math.floor(Math.random() * users.length)];
        const randomComment =
          sampleComments[Math.floor(Math.random() * sampleComments.length)];

        post.comments.push({
          user: randomCommenter._id,
          text: randomComment,
          createdAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ),
        });
      }

      await post.save();
      posts.push(post);

      // Add post to user's posts array
      await User.findByIdAndUpdate(postUser._id, {
        $push: { posts: post._id },
      });

      console.log(`📸 Created post: ${post.caption.substring(0, 50)}...`);
    }

    // Create meaningful follow relationships for better feed experience
    console.log("👥 Creating follow relationships...");

    // Create a more realistic following pattern
    const followPatterns = [
      // GlobeTrotterGia follows travel photographers
      {
        follower: "GlobeTrotterGia",
        following: [
          "PixelPete",
          "WanderlustWill",
          "TrailblazerTina",
          "AnnaAdventures",
        ],
      },
      // PixelPete follows other photographers and travelers
      {
        follower: "PixelPete",
        following: [
          "LeoLens",
          "ViewfinderVicky",
          "GlobeTrotterGia",
          "CityScaper",
        ],
      },
      // WanderlustWill follows adventure seekers
      {
        follower: "WanderlustWill",
        following: [
          "TrailblazerTina",
          "MountainMike",
          "TrekkerTom",
          "GlobeTrotterGia",
        ],
      },
      // CityScaper follows urban explorers
      {
        follower: "CityScaper",
        following: [
          "UrbanExplorer",
          "HistoricHarry",
          "PixelPete",
          "PassportPaul",
        ],
      },
      // HistoricHarry follows culture and history enthusiasts
      {
        follower: "HistoricHarry",
        following: [
          "CultureClara",
          "ViewfinderVicky",
          "CityScaper",
          "JourneyJen",
        ],
      },
      // TrailblazerTina follows other adventurers
      {
        follower: "TrailblazerTina",
        following: [
          "WanderlustWill",
          "MountainMike",
          "SafariSue",
          "GlobeTrotterGia",
        ],
      },
      // AnnaAdventures follows diverse travelers
      {
        follower: "AnnaAdventures",
        following: ["GlobeTrotterGia", "NomadNina", "ExplorerEd", "RoverRick"],
      },
      // LeoLens follows photographers
      {
        follower: "LeoLens",
        following: [
          "PixelPete",
          "ViewfinderVicky",
          "CityScaper",
          "PassportPaul",
        ],
      },
      // SafariSue follows nature and adventure accounts
      {
        follower: "SafariSue",
        following: [
          "TrailblazerTina",
          "MountainMike",
          "TrekkerTom",
          "IslaInspired",
        ],
      },
      // MountainMike follows outdoor enthusiasts
      {
        follower: "MountainMike",
        following: [
          "WanderlustWill",
          "TrailblazerTina",
          "TrekkerTom",
          "SafariSue",
        ],
      },
      // CultureClara follows cultural and historical accounts
      {
        follower: "CultureClara",
        following: [
          "HistoricHarry",
          "ViewfinderVicky",
          "JourneyJen",
          "ExplorerEd",
        ],
      },
      // UrbanExplorer follows city and architecture accounts
      {
        follower: "UrbanExplorer",
        following: ["CityScaper", "PixelPete", "LeoLens", "HistoricHarry"],
      },
      // ViewfinderVicky follows photographers and travelers
      {
        follower: "ViewfinderVicky",
        following: ["PixelPete", "LeoLens", "CultureClara", "HistoricHarry"],
      },
      // PassportPaul follows travel accounts
      {
        follower: "PassportPaul",
        following: ["GlobeTrotterGia", "LeoLens", "CityScaper", "NomadNina"],
      },
      // RoverRick follows diverse travel accounts
      {
        follower: "RoverRick",
        following: [
          "AnnaAdventures",
          "ExplorerEd",
          "JourneyJen",
          "GlobeTrotterGia",
        ],
      },
      // IslaInspired follows island and remote destination accounts
      {
        follower: "IslaInspired",
        following: ["SafariSue", "TrailblazerTina", "NomadNina", "RoverRick"],
      },
      // TrekkerTom follows outdoor and adventure accounts
      {
        follower: "TrekkerTom",
        following: [
          "MountainMike",
          "WanderlustWill",
          "TrailblazerTina",
          "SafariSue",
        ],
      },
      // NomadNina follows digital nomads and travelers
      {
        follower: "NomadNina",
        following: [
          "AnnaAdventures",
          "PassportPaul",
          "IslaInspired",
          "RoverRick",
        ],
      },
      // JourneyJen follows storytellers and travelers
      {
        follower: "JourneyJen",
        following: ["CultureClara", "HistoricHarry", "RoverRick", "ExplorerEd"],
      },
      // ExplorerEd follows landmark and destination accounts
      {
        follower: "ExplorerEd",
        following: [
          "AnnaAdventures",
          "RoverRick",
          "JourneyJen",
          "CultureClara",
        ],
      },
    ];

    for (const pattern of followPatterns) {
      const followerUser = users.find((u) => u.username === pattern.follower);
      if (!followerUser) continue;

      for (const followingUsername of pattern.following) {
        const followingUser = users.find(
          (u) => u.username === followingUsername
        );
        if (
          !followingUser ||
          followingUser._id.toString() === followerUser._id.toString()
        )
          continue;

        await User.findByIdAndUpdate(followerUser._id, {
          $addToSet: { following: followingUser._id },
        });
        await User.findByIdAndUpdate(followingUser._id, {
          $addToSet: { followers: followerUser._id },
        });
      }
      console.log(
        `👥 Created follow relationships for: ${followerUser.username}`
      );
    }

    console.log("\n🎉 Database seeded successfully!");
    console.log(`📊 Created ${users.length} users and ${posts.length} posts`);
    console.log("\n🔑 Test credentials:");
    console.log("Email: giatraveler@example.com, Password: password123");
    console.log("Email: pixelpete@example.com, Password: password123");
    console.log("Email: wanderlustwill@example.com, Password: password123");
    console.log("Email: cityscaper@example.com, Password: password123");
    console.log("Email: historicharry@example.com, Password: password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();

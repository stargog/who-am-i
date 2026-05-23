/**
 * Story deck source — tiers A/B/C for anime, movies, and TV.
 * Anime accepts English display name or romaji (see anime-romaji.mjs).
 */

import { ANIME_ROMAJI } from "./anime-romaji.mjs";

/** @typedef {"a"|"b"|"c"} Tier */
/** @typedef {"anime_stories"|"movie_stories"|"tv_stories"} StoryCategory */

/**
 * @param {object} o
 * @param {string} o.id
 * @param {string} o.name
 * @param {StoryCategory} o.category
 * @param {Tier} o.tier
 * @param {string[]} o.hints
 * @param {string[]} o.facts
 * @param {string} [o.nameRomaji]
 * @param {string[]} [o.aliases]
 */
function story(o) {
  return o;
}

function anime(id, name, tier, hints, facts, aliases = []) {
  const nameRomaji = ANIME_ROMAJI[id];
  if (!nameRomaji) {
    throw new Error(`Missing romaji for anime id: ${id}`);
  }
  return story({
    id,
    name,
    nameRomaji,
    category: "anime_stories",
    tier,
    hints,
    facts,
    aliases,
  });
}

function movie(id, name, tier, hints, facts, aliases = []) {
  return story({
    id,
    name,
    category: "movie_stories",
    tier,
    hints,
    facts,
    aliases,
  });
}

function tv(id, name, tier, hints, facts, aliases = []) {
  return story({
    id,
    name,
    category: "tv_stories",
    tier,
    hints,
    facts,
    aliases,
  });
}

export const STORIES = [
  // ─── Anime Tier A ─────────────────────────────────────────────
  anime("one-piece", "One Piece", "a", ["Japanese anime", "About pirates", "Very long-running series"], ["Monkey D. Luffy searches for the ultimate treasure left by Gol D. Roger."]),
  anime("naruto", "Naruto", "a", ["Japanese anime", "Ninja world", "Orange jumpsuit hero"], ["A young ninja seeks recognition and dreams of becoming Hokage."]),
  anime("dragon-ball", "Dragon Ball", "a", ["Japanese anime", "Martial arts and aliens", "Collects magical orbs"], ["Goku and friends defend Earth while searching for Dragon Balls."], ["Dragon Ball Z", "Doragon Boru Zetto"]),
  anime("pokemon", "Pokémon", "a", ["Japanese anime", "Creatures in balls", "Catch and battle them"], ["Trainers journey to become Pokémon Masters."], ["Pokemon", "Poketto Monsutā"]),
  anime("bleach", "Bleach", "a", ["Japanese anime", "Soul reapers", "Orange-haired teen fights spirits"], ["Ichigo Kurosaki gains powers to protect humans from hollows."]),
  anime("hunter-x-hunter", "Hunter x Hunter", "a", ["Japanese anime", "Hunters and exams", "Young boy searches for his father"], ["Gon Freecss takes the Hunter Exam to find his father Ging."]),
  anime("jojo", "JoJo's Bizarre Adventure", "a", ["Japanese anime", "Generations of Joestars", "Stands and dramatic poses"], ["The Joestar family battles supernatural enemies across generations."]),
  anime("doraemon", "Doraemon", "a", ["Japanese anime", "Robot cat from the future", "Gadget pocket"], ["A robotic cat helps a boy named Nobita with future gadgets."]),
  anime("demon-slayer", "Demon Slayer", "a", ["Japanese anime", "Demons and swordsmen", "Taisho-era Japan"], ["Tanjiro Kamado fights demons after his family is slaughtered."], ["Kimetsu no Yaiba"]),
  anime("attack-on-titan", "Attack on Titan", "a", ["Japanese anime", "Giant humanoid walls", "Military against titans"], ["Humanity lives behind walls fearing man-eating Titans."], ["Shingeki no Kyojin"]),
  anime("my-hero-academia", "My Hero Academia", "a", ["Japanese anime", "Superhero school", "Quirks are superpowers"], ["Izuku Midoriya trains to become the greatest hero."], ["Boku no Hero Academia"]),
  anime("jujutsu-kaisen", "Jujutsu Kaisen", "a", ["Japanese anime", "Cursed spirits", "Modern-day sorcerers"], ["Yuji Itadori joins Jujutsu High to fight curses."]),
  anime("death-note", "Death Note", "a", ["Japanese anime", "Supernatural notebook", "Cat-and-mouse thriller"], ["A student uses a notebook that can kill anyone whose name is written in it."]),
  anime("chainsaw-man", "Chainsaw Man", "a", ["Japanese anime", "Devils and hunters", "Chainsaw powers"], ["Denji merges with his dog Pochita to hunt devils for a normal life."]),
  anime("spy-x-family", "Spy x Family", "a", ["Japanese anime", "Spy family comedy", "Cold War–like setting"], ["A spy, assassin, and telepath form a fake family for their missions."]),
  anime("sailor-moon", "Sailor Moon", "a", ["Japanese anime", "Magical girl team", "Moon-themed heroes"], ["Usagi Tsukino becomes Sailor Moon to fight evil."]),
  anime("evangelion", "Neon Genesis Evangelion", "a", ["Japanese anime", "Mecha and angels", "Psychological themes"], ["Teenagers pilot Evangelions to protect Earth from Angels."], ["Evangelion"]),
  anime("cowboy-bebop", "Cowboy Bebop", "a", ["Japanese anime", "Space bounty hunters", "Jazz-inspired tone"], ["Spike Spiegel and crew chase bounties aboard the Bebop."]),
  anime("fma-brotherhood", "Fullmetal Alchemist: Brotherhood", "a", ["Japanese anime", "Alchemy rules", "Two brothers seek a Philosopher's Stone"], ["Edward and Alphonse Elric try to restore their bodies after a failed ritual."], ["Fullmetal Alchemist", "Hagane no Renkinjutsushi"]),
  anime("sword-art-online", "Sword Art Online", "a", ["Japanese anime", "Trapped in VR game", "Swords and levels"], ["Players are trapped in a VRMMORPG where death is real."]),
  anime("tokyo-ghoul", "Tokyo Ghoul", "a", ["Japanese anime", "Ghouls eat humans", "Half-ghoul protagonist"], ["Ken Kaneki becomes part ghoul and is caught between two worlds."]),
  anime("spirited-away", "Spirited Away", "a", ["Japanese anime film", "Studio Ghibli", "Spirit bathhouse"], ["Chihiro works in a spirit world to save her parents."]),
  anime("totoro", "My Neighbor Totoro", "a", ["Japanese anime film", "Studio Ghibli", "Forest spirits"], ["Two sisters befriend forest spirits including Totoro."]),
  anime("howls-moving-castle", "Howl's Moving Castle", "a", ["Japanese anime film", "Studio Ghibli", "Wizard and moving castle"], ["Sophie is cursed by a witch and finds refuge in Howl's castle."]),
  anime("princess-mononoke", "Princess Mononoke", "a", ["Japanese anime film", "Studio Ghibli", "Nature vs industry"], ["Ashitaka mediates conflict between forest gods and iron town."]),
  anime("your-name", "Your Name", "a", ["Japanese anime film", "Body swap", "Comet disaster"], ["Two teenagers mysteriously swap bodies and try to find each other."], ["Kimi no Na wa"]),
  anime("akira", "Akira", "a", ["Japanese anime film", "Cyberpunk Neo-Tokyo", "Psychic powers"], ["A biker gang member gains devastating psychic powers in future Tokyo."]),
  anime("ghost-in-the-shell", "Ghost in the Shell", "a", ["Japanese anime", "Cyborg police", "Philosophical sci-fi"], ["Major Motoko Kusanagi hunts cyber-criminals in a networked future."]),
  anime("slam-dunk", "Slam Dunk", "a", ["Japanese anime", "Basketball", "Delinquent joins team"], ["Hanamichi Sakuragi joins his school basketball team and grows as a player."]),
  anime("detective-conan", "Detective Conan", "a", ["Japanese anime", "Child detective", "Shrunken teenage sleuth"], ["Shinichi Kudo is transformed into a child and solves cases as Conan Edogawa."], ["Case Closed"]),
  anime("digimon-adventure", "Digimon Adventure", "a", ["Japanese anime", "Digital monsters", "Kids in another world"], ["Children partner with Digimon to save both worlds."]),
  anime("yu-gi-oh", "Yu-Gi-Oh!", "a", ["Japanese anime", "Card dueling", "Ancient Egyptian spirit"], ["Yugi Mutou solves puzzles and duels with the Millennium Puzzle's power."]),
  anime("captain-tsubasa", "Captain Tsubasa", "a", ["Japanese anime", "Football/soccer", "Prodigy striker"], ["Tsubasa Ozora pursues his dream of winning the World Cup."]),
  anime("gintama", "Gintama", "a", ["Japanese anime", "Comedy samurai sci-fi", "Alien occupation of Edo"], ["Gintoki Sakata takes odd jobs in an alternate Edo period Japan."]),
  anime("code-geass", "Code Geass", "a", ["Japanese anime", "Mecha and strategy", "Power to command obedience"], ["Lelouch vi Britannia leads a rebellion with the Geass power."], ["Code Geass Lelouch of the Rebellion"]),
  anime("one-punch-man", "One Punch Man", "a", ["Japanese anime", "Superhero parody", "Hero defeats foes in one punch"], ["Saitama seeks a worthy opponent after becoming too strong from training."]),
  anime("mob-psycho", "Mob Psycho 100", "a", ["Japanese anime", "Psychic powers", "Middle school esper"], ["Shigeo Kageyama suppresses his emotions while working for a fake psychic."]),
  anime("haikyu", "Haikyu!!", "a", ["Japanese anime", "Volleyball", "Short player spikes"], ["Shoyo Hinata and Tobio Kageyama push Karasuno toward nationals."]),
  anime("dragon-ball-super", "Dragon Ball Super", "a", ["Japanese anime", "Sequel to Dragon Ball Z", "Gods of destruction"], ["Goku faces universes-level threats after the Buu saga."], ["DBS"]),
  anime("nausicaa", "Nausicaä of the Valley of the Wind", "a", ["Japanese anime film", "Studio Ghibli", "Post-apocalyptic ecology"], ["Nausicaä tries to prevent war between humans and the toxic jungle."]),
  anime("kiki-delivery-service", "Kiki's Delivery Service", "a", ["Japanese anime film", "Studio Ghibli", "Young witch delivery service"], ["Kiki trains as a witch and runs a delivery service by broomstick."]),
  anime("castle-in-the-sky", "Castle in the Sky", "a", ["Japanese anime film", "Studio Ghibli", "Floating castle Laputa"], ["Sheeta and Pazu seek a legendary castle in the sky."]),

  // ─── Anime Tier B ─────────────────────────────────────────────
  anime("kurokos-basketball", "Kuroko's Basketball", "b", ["Japanese anime", "Basketball", "Generation of Miracles"], ["Tetsuya Kuroko supports a team aiming to defeat his former middle school stars."]),
  anime("steins-gate", "Steins;Gate", "b", ["Japanese anime", "Time travel", "Microwave experiments"], ["Okabe Rintaro discovers their lab can send messages to the past."]),
  anime("re-zero", "Re:Zero", "b", ["Japanese anime", "Isekai", "Return by death"], ["Subaru Natsuki is summoned to another world and resets on death."]),
  anime("black-clover", "Black Clover", "b", ["Japanese anime", "Magic knights", "No-magic protagonist"], ["Asta aims to become Wizard King despite having no magic."]),
  anime("fairy-tail", "Fairy Tail", "b", ["Japanese anime", "Guild of mages", "Friendship power"], ["Natsu Dragneel and the Fairy Tail guild take magic requests."]),
  anime("vinland-saga", "Vinland Saga", "b", ["Japanese anime", "Vikings", "Historical revenge"], ["Thorfinn seeks revenge against the man who killed his father."]),
  anime("blue-lock", "Blue Lock", "b", ["Japanese anime", "Football", "Ego-driven training program"], ["Japan's striker project isolates forwards to create a world-class egoist."]),
  anime("frieren", "Frieren: Beyond Journey's End", "b", ["Japanese anime", "Elf mage", "After the hero party wins"], ["Frieren revisits places from her journey after the Demon King is defeated."]),
  anime("solo-leveling", "Solo Leveling", "b", ["Japanese anime", "Hunters and dungeons", "Weakest becomes strongest"], ["Sung Jinwoo is the only hunter who can level up infinitely."]),
  anime("ponyo", "Ponyo", "b", ["Japanese anime film", "Studio Ghibli", "Fish-girl and boy"], ["A goldfish princess wants to become human after meeting Sosuke."]),
  anime("initial-d", "Initial D", "b", ["Japanese anime", "Street racing", "Mountain passes"], ["Takumi Fujiwara delivers tofu and becomes a legendary downhill racer."]),
  anime("madoka-magica", "Puella Magi Madoka Magica", "b", ["Japanese anime", "Magical girls", "Dark twist on genre"], ["Madoka Kaname is offered a contract to become a magical girl."]),
  anime("monogatari", "Monogatari Series", "b", ["Japanese anime", "Supernatural oddities", "Wordplay-heavy dialogue"], ["Koyomi Araragi helps classmates afflicted by oddities and apparitions."]),
  anime("psycho-pass", "Psycho-Pass", "b", ["Japanese anime", "Crime coefficient", "Dystopian Japan"], ["Inspectors hunt criminals judged by the Sibyl System's psycho-pass."]),
  anime("gundam", "Mobile Suit Gundam", "b", ["Japanese anime", "Mecha war", "Real robot genre pioneer"], ["Amuro Ray pilots the Gundam in the One Year War between Earth and colonies."]),
  anime("bocchi-the-rock", "Bocchi the Rock!", "b", ["Japanese anime", "Rock band", "Social anxiety"], ["Hitori Gotoh joins a band and struggles to overcome her shyness."]),
  anime("oshi-no-ko", "Oshi no Ko", "b", ["Japanese anime", "Idol industry", "Reincarnation mystery"], ["A doctor reincarnates as the son of his favorite idol and uncovers dark secrets."]),
  anime("hells-paradise", "Hell's Paradise", "b", ["Japanese anime", "Ninja on death island", "Immortality quest"], ["Gabimaru the Hollow seeks a pardon by finding the elixir of life on an island."]),
  anime("dr-stone", "Dr. Stone", "b", ["Japanese anime", "Science rebuilds world", "Everyone petrified"], ["Senku Ishigami revives civilization using science after a global petrification."]),
  anime("fire-force", "Fire Force", "b", ["Japanese anime", "Firefighters vs infernals", "Spontaneous human combustion"], ["Shinra Kusakabe joins Company 8 to fight infernals and uncover a conspiracy."]),
  anime("tokyo-revengers", "Tokyo Revengers", "b", ["Japanese anime", "Time leap", "Delinquent gangs"], ["Takemichi Hanagaki travels back to save his girlfriend from a tragic fate."]),
  anime("made-in-abyss", "Made in Abyss", "b", ["Japanese anime", "Giant hole in earth", "Cute but dark adventure"], ["Riko and Reg descend the Abyss seeking her mother at the bottom."]),

  // ─── Anime Tier C ─────────────────────────────────────────────
  anime("my-dress-up-darling", "My Dress-Up Darling", "c", ["Japanese anime", "Cosplay romance", "Shy craftsman"], ["Wakana Gojo helps Marin Kitagawa create cosplay outfits."]),
  anime("soul-eater", "Soul Eater", "c", ["Japanese anime", "Weapon partners", "Shinigami academy"], ["Students at Death Weapon Meister Academy collect evil souls."]),
  anime("black-butler", "Black Butler", "c", ["Japanese anime", "Victorian demon butler", "Revenge contract"], ["Ciel Phantomhive serves the queen with help from demon butler Sebastian."]),
  anime("noragami", "Noragami", "c", ["Japanese anime", "Minor god for hire", "Five-yen wishes"], ["Yato is a stray god trying to build his own shrine."]),
  anime("durarara", "Durarara!!", "c", ["Japanese anime", "Ikebukuro urban legend", "Headless rider"], ["Many characters' stories intertwine in Ikebukuro including Celty the dullahan."]),
  anime("bakuman", "Bakuman", "c", ["Japanese anime", "Creating manga", "Two friends as artist-writer"], ["Moritaka and Akito aim to get their manga serialized in Jump."]),
  anime("parasyte", "Parasyte", "c", ["Japanese anime", "Alien parasites", "Hand becomes sentient"], ["Shinichi Izumi's right hand is taken over by a parasite named Migi."]),
  anime("ergo-proxy", "Ergo Proxy", "c", ["Japanese anime", "Post-apocalyptic mystery", "Philosophical sci-fi"], ["Re-l Mayer investigates awakened monsters called Proxies."]),
  anime("flcl", "FLCL", "c", ["Japanese anime", "Surreal coming-of-age", "Guitar from head"], ["Naota Nandaba's mundane life is disrupted by Haruko Haruhara and robots."]),
  anime("kill-la-kill", "Kill la Kill", "c", ["Japanese anime", "Living uniforms", "Over-the-top action"], ["Ryuko Matoi seeks her father's killer at Honnouji Academy."]),
  anime("promare", "Promare", "c", ["Japanese anime film", "Firefighters vs mutants", "Trigger studio style"], ["Lio Fotia and Galo Thymos clash as Burnish mutants face extinction."]),
  anime("weathering-with-you", "Weathering with You", "c", ["Japanese anime film", "Rain and sunshine girl", "Tokyo floods"], ["Hodaka meets Hina, who can clear the sky with her prayers."]),
  anime("a-silent-voice", "A Silent Voice", "c", ["Japanese anime film", "Bullying redemption", "Deaf classmate"], ["Shoya Ishida tries to make amends with Shoko Nishimiya."]),
  anime("perfect-blue", "Perfect Blue", "c", ["Japanese anime film", "Psychological thriller", "Idol turns actress"], ["Mima Kirigoe's reality blurs as she becomes a target of obsession."]),
  anime("paprika", "Paprika", "c", ["Japanese anime film", "Dream technology", "Surreal imagery"], ["Therapists use DC Mini devices until dreams leak into reality."]),
  anime("violet-evergarden", "Violet Evergarden", "c", ["Japanese anime", "War orphan writer", "Letters and emotions"], ["Violet learns the meaning of love while writing letters for others."]),
  anime("banana-fish", "Banana Fish", "c", ["Japanese anime", "Crime conspiracy", "1980s New York"], ["Ash Lynx investigates a drug called Banana Fish linked to his brother."]),
  anime("given", "Given", "c", ["Japanese anime", "Boys' love band", "Guitar and vocals"], ["Mafuyu Sato joins a band and processes grief through music."]),
  anime("beastars", "Beastars", "c", ["Japanese anime", "Anthropomorphic school", "Wolf and rabbit"], ["Legoshi, a gray wolf, struggles with instincts in a herbivore-carnivore society."]),
  anime("odd-taxi", "Odd Taxi", "c", ["Japanese anime", "Taxi driver mystery", "Anthropomorphic cast"], ["Odokawa's taxi rides connect strangers in a missing-girl case."]),
  anime("mashle", "Mashle: Magic and Muscles", "c", ["Japanese anime", "Magic school parody", "Muscles beat spells"], ["Mash Burnedead survives a magic world using only physical strength."]),
  anime("undead-unluck", "Undead Unluck", "c", ["Japanese anime", "Supernatural negators", "Loop and immortality"], ["Andy and Fuuko seek the Union's truth while hunted for their unluck."]),
  anime("dandadan", "Dandadan", "c", ["Japanese anime", "Aliens and ghosts", "Romantic comedy action"], ["Momo and Okarun battle aliens and yokai while navigating high school."]),
  anime("hellsing", "Hellsing", "c", ["Japanese anime", "Vampire organization", "Alucard serves Integra"], ["The Hellsing Organization fights supernatural threats in England."]),
  anime("trigun", "Trigun", "c", ["Japanese anime", "Bounty on pacifist", "Desert planet"], ["Vash the Stampede is a gunslinger with a huge bounty and a peaceful heart."]),
  anime("samurai-champloo", "Samurai Champloo", "c", ["Japanese anime", "Hip-hop samurai road trip", "Edo-era Japan"], ["Fuu hires two swordsmen to find a sunflower samurai."]),
  anime("serial-experiments-lain", "Serial Experiments Lain", "c", ["Japanese anime", "Internet reality blur", "Early cyberpunk"], ["Lain Iwakura explores the Wired and questions identity."], ["Lain"]),
  anime("cardcaptor-sakura", "Cardcaptor Sakura", "c", ["Japanese anime", "Magical cards", "Young girl captures Clow Cards"], ["Sakura Kinomoto must capture magical cards she accidentally released."]),
  anime("ranma", "Ranma ½", "c", ["Japanese anime", "Gender-bending curse", "Martial arts comedy"], ["Ranma Saotome turns into a girl when splashed with cold water."]),
  anime("inuyasha", "Inuyasha", "c", ["Japanese anime", "Feudal Japan demons", "Time-traveling schoolgirl"], ["Kagome and half-demon Inuyasha seek shards of the Shikon Jewel."]),
  anime("rurouni-kenshin", "Rurouni Kenshin", "c", ["Japanese anime", "Meiji-era swordsman", "Reverse-blade sword"], ["Himura Kenshin wanders Japan protecting people without killing."]),
  anime("bleach-thousand-year", "Bleach: Thousand-Year Blood War", "c", ["Japanese anime", "Sequel arc animated", "Quincy war returns"], ["Ichigo faces the Wandenreich's invasion in the final Bleach arc."]),

  // ─── Movies Tier A ────────────────────────────────────────────
  movie("star-wars", "Star Wars", "a", ["Sci-fi space opera", "Jedi and lightsabers", "Galactic empire"], ["Farm boy Luke Skywalker joins rebels against the evil Empire."]),
  movie("avengers", "The Avengers", "a", ["Marvel superheroes team up", "Earth invasion", "2012 ensemble film"], ["Iron Man, Captain America, Thor, and others unite against Loki."]),
  movie("iron-man", "Iron Man", "a", ["Marvel", "Billionaire in powered suit", "Starts MCU"], ["Tony Stark builds a suit after being held captive in a cave."]),
  movie("spider-man", "Spider-Man", "a", ["Marvel", "Teen with spider powers", "Great responsibility"], ["Peter Parker becomes Spider-Man after a radioactive spider bite."]),
  movie("black-panther", "Black Panther", "a", ["Marvel", "Wakanda", "African superhero king"], ["T'Challa returns to rule Wakanda and faces Killmonger."]),
  movie("harry-potter", "Harry Potter", "a", ["Wizard school", "Boy who lived", "British fantasy films"], ["Harry Potter discovers he is a wizard and fights Lord Voldemort."]),
  movie("lotr", "The Lord of the Rings", "a", ["Fantasy epic", "Ring must be destroyed", "Middle-earth"], ["Frodo Baggins carries the One Ring to Mount Doom."]),
  movie("the-hobbit", "The Hobbit", "a", ["Fantasy prequel", "Dragon Smaug", "Company of dwarves"], ["Bilbo Baggins joins dwarves to reclaim Erebor from Smaug."]),
  movie("jurassic-park", "Jurassic Park", "a", ["Dinosaurs cloned", "Theme park disaster", "Spielberg blockbuster"], ["Scientists recreate dinosaurs on an island where security fails."]),
  movie("james-bond", "James Bond", "a", ["British spy", "007 codename", "Long-running franchise"], ["Secret agent James Bond takes on global villains for MI6."]),
  movie("fast-and-furious", "Fast & Furious", "a", ["Street racing", "Family theme", "Over-the-top action"], ["Dominic Toretto's crew evolves from racers to global heist specialists."]),
  movie("indiana-jones", "Indiana Jones", "a", ["Archaeologist adventurer", "Whip and fedora", "Ancient artifacts"], ["Indiana Jones races Nazis and cults for legendary relics."]),
  movie("mission-impossible", "Mission: Impossible", "a", ["Spy thriller", "Impossible missions", "Tom Cruise stunts"], ["Ethan Hunt and the IMF carry out covert operations worldwide."]),
  movie("lion-king", "The Lion King", "a", ["Disney animation", "African savanna", "Circle of life"], ["Simba must reclaim Pride Rock from his uncle Scar."]),
  movie("frozen", "Frozen", "a", ["Disney animation", "Ice powers", "Let it go"], ["Elsa hides her powers while Anna searches for her in a frozen kingdom."]),
  movie("moana", "Moana", "a", ["Disney animation", "Polynesian voyage", "Ocean chooses her"], ["Moana sails across the ocean to restore the heart of Te Fiti."]),
  movie("aladdin", "Aladdin", "a", ["Disney animation", "Genie in lamp", "Agrabah street rat"], ["Aladdin finds a magic lamp and poses as a prince to win Jasmine."]),
  movie("beauty-and-the-beast", "Beauty and the Beast", "a", ["Disney animation", "Cursed prince", "Enchanted castle"], ["Belle learns to love the Beast to break his curse."]),
  movie("little-mermaid", "The Little Mermaid", "a", ["Disney animation", "Mermaid wants legs", "Under the sea"], ["Ariel trades her voice to become human and meet Prince Eric."]),
  movie("toy-story", "Toy Story", "a", ["Pixar animation", "Toys come alive", "Cowboy and space ranger"], ["Woody and Buzz Lightyear learn to share Andy's room."]),
  movie("finding-nemo", "Finding Nemo", "a", ["Pixar animation", "Clownfish father", "Ocean journey"], ["Marlin crosses the ocean to rescue his son Nemo."]),
  movie("the-incredibles", "The Incredibles", "a", ["Pixar animation", "Superhero family", "Forced to hide powers"], ["The Parr family suits up to stop Syndrome and save the city."]),
  movie("coco", "Coco", "a", ["Pixar animation", "Day of the Dead", "Music banned in family"], ["Miguel enters the Land of the Dead to learn about his ancestor."]),
  movie("inside-out", "Inside Out", "a", ["Pixar animation", "Emotions as characters", "Girl moves cities"], ["Joy and Sadness navigate Riley's mind during a difficult move."]),
  movie("up", "Up", "a", ["Pixar animation", "House with balloons", "Wilderness adventure"], ["Carl Fredricksen flies his house to Paradise Falls with Russell."]),
  movie("wall-e", "WALL·E", "a", ["Pixar animation", "Robot on empty Earth", "Love and cleanup"], ["WALL·E falls for EVE and helps humanity return to Earth."]),
  movie("titanic", "Titanic", "a", ["Historical romance", "Ship sinks", "Iceberg disaster"], ["Jack and Rose fall in love aboard the doomed RMS Titanic."]),
  movie("avatar", "Avatar", "a", ["Sci-fi Pandora", "Blue aliens Na'vi", "James Cameron"], ["Jake Sully joins the Na'vi through an avatar body on Pandora."]),
  movie("forrest-gump", "Forrest Gump", "a", ["Drama", "Runs across America", "Life is like a box of chocolates"], ["Forrest Gump unwittingly influences decades of American history."]),
  movie("the-godfather", "The Godfather", "a", ["Crime family", "Mafia saga", "Offer you can't refuse"], ["Michael Corleone transforms from outsider to head of the Corleone family."]),
  movie("shawshank", "The Shawshank Redemption", "a", ["Prison drama", "Hope and friendship", "Escape tunnel"], ["Andy Dufresne survives Shawshank prison and plans a secret escape."]),
  movie("pulp-fiction", "Pulp Fiction", "a", ["Nonlinear crime", "Tarantino", "Briefcase mystery"], ["Interwoven stories of hitmen, a boxer, and gangsters in Los Angeles."]),
  movie("inception", "Inception", "a", ["Dream heist", "Spinning top totem", "Christopher Nolan"], ["Dom Cobb plants an idea in a target's mind through shared dreaming."]),
  movie("interstellar", "Interstellar", "a", ["Space exploration", "Black hole", "Save humanity"], ["Cooper travels through a wormhole to find a new home for mankind."]),
  movie("the-matrix", "The Matrix", "a", ["Simulated reality", "Red pill or blue pill", "Neo is the One"], ["Neo learns humanity is trapped in a machine-controlled simulation."]),
  movie("terminator", "The Terminator", "a", ["Time-travel killer robot", "Sarah Connor", "Skynet future"], ["A cyborg is sent back to kill Sarah Connor before her son is born."]),
  movie("alien", "Alien", "a", ["Horror sci-fi", "Xenomorph creature", "In space no one hears you"], ["Ripley and the Nostromo crew face a deadly alien organism."]),
  movie("jaws", "Jaws", "a", ["Shark thriller", "Beach town terror", "Spielberg blockbuster"], ["Police chief Brody hunts a great white shark attacking Amity Island."]),
  movie("et", "E.T. the Extra-Terrestrial", "a", ["Family sci-fi", "Alien stranded on Earth", "Bicycle flies"], ["A boy befriends a stranded alien and helps him phone home."]),
  movie("back-to-the-future", "Back to the Future", "a", ["Time travel", "DeLorean car", "Parents must meet"], ["Marty McFly accidentally travels to 1955 and must unite his parents."]),
  movie("halloween", "Halloween", "a", ["Slasher horror", "Michael Myers mask", "Haddonfield stalking"], ["Michael Myers returns home to terrorize babysitters on Halloween night."]),
  movie("scream", "Scream", "a", ["Meta slasher", "Ghostface killer", "Rules of horror films"], ["A masked killer targets teens who know horror movie tropes."]),
  movie("the-conjuring", "The Conjuring", "a", ["Horror", "Paranormal investigators", "Based on Warren cases"], ["Ed and Lorraine Warren help a family haunted in a Rhode Island farmhouse."]),
  movie("john-wick", "John Wick", "a", ["Action", "Retired assassin", "Dog revenge"], ["John Wick returns to the underworld after criminals kill his puppy."]),
  movie("top-gun-maverick", "Top Gun: Maverick", "a", ["Fighter pilots", "Sequel decades later", "Training elite flyers"], ["Pete Maverick Mitchell trains Top Gun graduates for a dangerous mission."]),
  movie("barbie", "Barbie", "a", ["Comedy fantasy", "Doll comes to real world", "2023 pink blockbuster"], ["Barbie leaves Barbieland after an existential crisis."]),
  movie("oppenheimer", "Oppenheimer", "a", ["Biographical drama", "Atomic bomb project", "Manhattan Project"], ["J. Robert Oppenheimer leads development of the nuclear bomb in WWII."]),

  // ─── Movies Tier B ────────────────────────────────────────────
  movie("gladiator", "Gladiator", "b", ["Roman arena", "Revenge for family", "Russell Crowe"], ["Maximus seeks vengeance against Emperor Commodus as a gladiator."]),
  movie("pirates-caribbean", "Pirates of the Caribbean", "b", ["Swashbuckling fantasy", "Captain Jack Sparrow", "Cursed treasure"], ["Jack Sparrow and Will Turner battle undead pirates and the East India Company."]),
  movie("transformers", "Transformers", "b", ["Robots in disguise", "Autobots vs Decepticons", "Michael Bay action"], ["Sam Witwicky helps Autobots protect Earth from Decepticons."]),
  movie("dark-knight", "The Dark Knight", "b", ["Batman vs Joker", "Gotham crime", "Heath Ledger villain"], ["Batman faces the Joker's chaos while Harvey Dent falls."]),
  movie("batman", "Batman", "b", ["DC superhero", "Gotham vigilante", "Many film versions"], ["Bruce Wayne fights crime as the masked vigilante Batman."]),
  movie("superman", "Superman", "b", ["DC superhero", "Last son of Krypton", "Flies and super strength"], ["Clark Kent protects Earth as Superman from Metropolis."]),
  movie("wonder-woman", "Wonder Woman", "b", ["DC superhero", "Amazon warrior", "World War I setting"], ["Diana leaves Themyscira to end the war as Wonder Woman."]),
  movie("guardians-galaxy", "Guardians of the Galaxy", "b", ["Marvel space team", "Talking raccoon and tree", "Classic rock soundtrack"], ["Peter Quill's misfit crew saves the galaxy from Ronan."]),
  movie("deadpool", "Deadpool", "b", ["Marvel antihero", "Fourth-wall breaks", "R-rated humor"], ["Wade Wilson becomes Deadpool seeking revenge on Ajax."]),
  movie("shrek", "Shrek", "b", ["Animated fairy-tale parody", "Ogre and swamp", "Donkey sidekick"], ["Shrek rescues Fiona to get his swamp back from Lord Farquaad."]),
  movie("kung-fu-panda", "Kung Fu Panda", "b", ["Animated martial arts", "Chosen dragon warrior", "Panda named Po"], ["Po becomes the Dragon Warrior and defends the Valley of Peace."]),
  movie("how-to-train-dragon", "How to Train Your Dragon", "b", ["Vikings and dragons", "Boy befriends Night Fury", "Island of Berk"], ["Hiccup tames Toothless and changes how Vikings see dragons."]),
  movie("hunger-games", "The Hunger Games", "b", ["Dystopian arena", "Tribute girl archer", "Panem districts"], ["Katniss Everdeen volunteers for the deadly Hunger Games."]),
  movie("twilight", "Twilight", "b", ["Vampire romance", "Pacific Northwest", "Team Edward or Jacob"], ["Bella Swan falls for vampire Edward Cullen in Forks."]),
  movie("la-la-land", "La La Land", "b", ["Musical romance", "Los Angeles dreamers", "Jazz pianist and actress"], ["Mia and Sebastian pursue art and love in modern Los Angeles."]),
  movie("parasite", "Parasite", "b", ["Korean thriller", "Class inequality", "Oscar best picture"], ["The Kim family infiltrates the wealthy Park household with dark results."]),
  movie("the-shining", "The Shining", "b", ["Horror", "Isolated hotel", "Here's Johnny"], ["Jack Torrance descends into madness while caretaking the Overlook Hotel."]),
  movie("fight-club", "Fight Club", "b", ["Psychological drama", "Underground fights", "Twist identity"], ["An insomniac forms an underground fight club with Tyler Durden."]),
  movie("goodfellas", "Goodfellas", "b", ["Crime drama", "Mob life", "Scorsese classic"], ["Henry Hill rises and falls in the Italian-American mafia."]),
  movie("casablanca", "Casablanca", "b", ["Romance war", "Here's looking at you kid", "Morocco café"], ["Rick Blaine must choose love or helping refugees escape Nazis."]),
  movie("rocky", "Rocky", "b", ["Boxing underdog", "Philadelphia", "Stairs training montage"], ["Rocky Balboa gets a shot at the heavyweight championship."]),
  movie("home-alone", "Home Alone", "b", ["Christmas comedy", "Kid vs burglars", "Traps in house"], ["Kevin McCallister defends his home when left behind on vacation."]),
  movie("ghostbusters", "Ghostbusters", "b", ["Comedy horror", "Who you gonna call", "Proton packs"], ["Scientists start a business capturing ghosts in New York City."]),
  movie("men-in-black", "Men in Black", "b", ["Alien agents", "Neuralyzer memory wipe", "Black suits"], ["Agents K and J police extraterrestrial activity on Earth."]),
  movie("mad-max-fury-road", "Mad Max: Fury Road", "b", ["Post-apocalypse chase", "Furiosa escapes tyrant", "Desert wasteland"], ["Max and Furiosa flee Immortan Joe across the wasteland."]),

  // ─── Movies Tier C ────────────────────────────────────────────
  movie("blade-runner", "Blade Runner", "c", ["Sci-fi noir", "Replicants", "Rainy Los Angeles"], ["Deckard hunts bioengineered replicants in future LA."]),
  movie("the-exorcist", "The Exorcist", "c", ["Horror", "Demonic possession", "Priests perform exorcism"], ["Regan MacNeil is possessed and two priests attempt an exorcism."]),
  movie("se7en", "Se7en", "c", ["Crime thriller", "Seven deadly sins", "Rainy city detectives"], ["Two detectives hunt a serial killer themed on the seven sins."]),
  movie("memento", "Memento", "c", ["Reverse narrative", "Amnesia tattoos", "Christopher Nolan"], ["Leonard Shelby investigates his wife's murder with short-term memory loss."]),
  movie("the-prestige", "The Prestige", "c", ["Rival magicians", "Victorian London", "Twist ending"], ["Two illusionists sabotage each other obsessed with the perfect trick."]),
  movie("whiplash", "Whiplash", "c", ["Music drama", "Drummer and harsh teacher", "Jazz conservatory"], ["Andrew Neiman endures abuse from conductor Terence Fletcher to excel."]),
  movie("get-out", "Get Out", "c", ["Horror thriller", "Meet the parents", "Social satire"], ["Chris Washington uncovers horrifying secrets at his girlfriend's family estate."]),
  movie("knives-out", "Knives Out", "c", ["Murder mystery", "Detective Blanc", "Wealthy family"], ["A detective investigates the death of a wealthy crime novelist."]),
  movie("everything-everywhere", "Everything Everywhere All at Once", "c", ["Multiverse", "Laundromat family", "Oscar sweep"], ["Evelyn Wang experiences many universes while fighting a nihilistic threat."]),
  movie("dune", "Dune", "c", ["Sci-fi desert planet", "Spice melange", "Paul Atreides"], ["Paul Atreides becomes a leader on the desert planet Arrakis."]),
  movie("creed", "Creed", "c", ["Boxing legacy", "Rocky mentors", "Philadelphia fighter"], ["Adonis Johnson trains with Rocky Balboa to honor his father's legacy."]),
  movie("black-swan", "Black Swan", "c", ["Psychological thriller", "Ballet perfection", "Swan Lake role"], ["Nina Sayers unravels competing for the lead in Swan Lake."]),
  movie("the-grand-budapest", "The Grand Budapest Hotel", "c", ["Wes Anderson style", "Hotel concierge", "European caper"], ["Gustave H. and Zero Moustafa navigate murder and a stolen painting."]),
  movie("amelie", "Amélie", "c", ["French romance", "Paris whimsy", "Helps strangers secretly"], ["Amélie Poulain quietly improves lives while seeking her own happiness."]),
  movie("life-of-pi", "Life of Pi", "c", ["Survival at sea", "Tiger named Richard Parker", "Faith and story"], ["Pi Patel survives a shipwreck on a lifeboat with a Bengal tiger."]),

  // ─── TV Tier B ────────────────────────────────────────────────
  tv("squid-game", "Squid Game", "b", ["Korean series", "Deadly children's games", "Debt and prize money"], ["Contestants play childhood games for money with lethal penalties."], ["Ojing-eo Geim"]),
  tv("game-of-thrones", "Game of Thrones", "b", ["Fantasy kingdoms", "Iron Throne", "Dragons return"], ["Noble families war for control of the Seven Kingdoms of Westeros."]),
  tv("stranger-things", "Stranger Things", "b", ["1980s small town", "Upside Down dimension", "Kids on bikes"], ["Kids in Hawkins face monsters from an alternate dimension."]),
  tv("breaking-bad", "Breaking Bad", "b", ["Chemistry teacher", "Meth empire", "Heisenberg alias"], ["Walter White cooks meth after a terminal cancer diagnosis."]),
  tv("friends", "Friends", "b", ["Sitcom NYC", "Six friends café", "Central Perk"], ["Rachel, Ross, Monica, Chandler, Joey, and Phoebe navigate life in Manhattan."]),
  tv("the-simpsons", "The Simpsons", "b", ["Animated sitcom", "Springfield family", "Longest-running show"], ["Homer, Marge, Bart, Lisa, and Maggie Simpson satirize American life."]),
  tv("walking-dead", "The Walking Dead", "b", ["Zombie apocalypse", "Survivor groups", "Comic adaptation"], ["Rick Grimes leads survivors after the dead rise to eat the living."]),
  tv("the-office", "The Office", "b", ["Mockumentary sitcom", "Paper company", "Dunder Mifflin"], ["Employees of a Scranton paper branch face awkward humor daily."]),
  tv("lost", "Lost", "c", ["Island mystery", "Plane crash survivors", "Flashbacks and sci-fi"], ["Survivors of Oceanic 815 uncover strange forces on a mysterious island."]),
  tv("house-of-cards", "House of Cards", "c", ["Political drama", "Power couple", "Fourth wall breaks"], ["Frank Underwood schemes from congress to the presidency."]),
  tv("black-mirror", "Black Mirror", "c", ["Anthology sci-fi", "Technology dystopia", "Standalone episodes"], ["Each episode explores dark consequences of near-future technology."]),
  tv("the-mandalorian", "The Mandalorian", "b", ["Star Wars series", "Bounty hunter", "Baby Yoda Grogu"], ["Din Djarin protects Grogu while navigating the post-Empire galaxy."]),
  tv("loki", "Loki", "b", ["Marvel series", "God of mischief", "Time Variance Authority"], ["Loki variants threaten the timeline under TVA control."]),
  tv("wandavision", "WandaVision", "b", ["Marvel series", "Sitcom reality", "Scarlet Witch grief"], ["Wanda Maximoff creates a false suburban reality in Westview."]),
  tv("wednesday", "Wednesday", "b", ["Addams Family", "Nevermore Academy", "Supernatural mystery"], ["Wednesday Addams investigates murders at a school for outcasts."]),
  tv("the-boys", "The Boys", "b", ["Superhero satire", "Corrupt heroes", "Blackmail and revenge"], ["A vigilante group fights abusive corporate superheroes called The Seven."]),
  tv("chernobyl", "Chernobyl", "b", ["Historical miniseries", "Nuclear disaster", "Soviet cover-up"], ["Workers and officials respond to the 1986 Chernobyl reactor explosion."]),
  tv("peaky-blinders", "Peaky Blinders", "c", ["Gang family", "Post-WWI Birmingham", "Flat caps razor blades"], ["Tommy Shelby expands the Peaky Blinders crime empire."]),
  tv("sherlock", "Sherlock", "c", ["Modern Holmes", "BBC detective", "Watson blogger"], ["Sherlock Holmes solves crimes in contemporary London with Dr. Watson."]),
  tv("the-witcher", "The Witcher", "c", ["Fantasy monster hunter", "Geralt of Rivia", "Toss a coin"], ["Geralt navigates politics and monsters while protecting Ciri."]),
  tv("arcane", "Arcane", "b", ["Animated series", "League of Legends", "Piltover and Zaun"], ["Sisters Vi and Jinx are torn apart by war between twin cities."]),
  tv("avatar-tla", "Avatar: The Last Airbender", "b", ["Animated fantasy", "Four nations elements", "Aang the Avatar"], ["Aang must master all elements to end the Fire Nation's war."]),
  tv("fullmetal-tv", "Fullmetal Alchemist", "b", ["Anime TV series", "Brothers and alchemy", "Philosopher's Stone"], ["Ed and Al search for the Philosopher's Stone in this TV adaptation."], ["Fullmetal Alchemist 2003"]),
];

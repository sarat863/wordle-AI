// Built-in offline Wordle engine with curated target lists and solver logic

export const TARGET_5_WORDS = [
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN",
  "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE",
  "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA",
  "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWAKE", "AWARE",
  "BADLY", "BAKER", "BASES", "BASIC", "BASIS", "BEACH", "BEGAN", "BEGIN", "BEGUN", "BEING",
  "BELOW", "BENCH", "BILLY", "BIRTH", "BLACK", "BLAME", "BLIND", "BLOCK", "BLOOD", "BOARD",
  "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BREAD", "BREAK", "BREED", "BRIEF", "BRING",
  "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CALIF", "CARRY", "CATCH",
  "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD",
  "CHINA", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE",
  "COACH", "COAST", "COULD", "COUNT", "COURT", "COVER", "CRAFT", "CRANE", "CRASH", "CREAM",
  "CRIME", "CROSS", "CROWD", "CROWN", "CURVE", "CYCLE", "DAILY", "DANCE", "DATED", "DEALT",
  "DEATH", "DEBUT", "DELAY", "DEPTH", "DOING", "DOUBT", "DOZEN", "DRAFT", "DRAMA", "DRAWN",
  "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH",
  "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "EVENT",
  "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FIBER", "FIELD", "FIFTH",
  "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED", "FLASH", "FLEET", "FLOOR", "FLUID", "FOCUS",
  "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT",
  "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE",
  "GRAND", "GRANT", "GRASS", "GREAT", "GREEN", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS",
  "GUEST", "GUIDE", "HAPPY", "HARRY", "HEART", "HEAVY", "HENCE", "HENRY", "HORSE", "HOTEL",
  "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "JAPAN", "JIMMY",
  "JOINT", "JONES", "JUDGE", "KNOWN", "LABEL", "LARGE", "LASER", "LATER", "LAUGH", "LAYER",
  "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LEWIS", "LIGHT", "LIMIT", "LINKS",
  "LIVES", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYING", "MAGIC", "MAJOR",
  "MAKER", "MARCH", "MARIA", "MATCH", "MAYBE", "MAYOR", "MEANT", "MEDIA", "METAL", "MIGHT",
  "MINOR", "MINUS", "MIXED", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE",
  "MOUTH", "MOVIE", "MUSIC", "NEEDS", "NEVER", "NEWLY", "NIGHT", "NOISE", "NORTH", "NOTED",
  "NOVEL", "NURSE", "OCCUR", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "PAINT", "PANEL",
  "PAPER", "PARTY", "PEACE", "PETER", "PHASE", "PHONE", "PHOTO", "PIECE", "PILOT", "PITCH",
  "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE",
  "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "QUEEN", "QUICK",
  "QUIET", "QUITE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY",
  "REFER", "RIGHT", "RIVAL", "RIVER", "ROBIN", "ROGER", "ROMAN", "ROUGH", "ROUND", "ROUTE",
  "ROYAL", "RURAL", "SCALE", "SCENE", "SCOPE", "SCORE", "SENSE", "SERVE", "SEVEN", "SHALL",
  "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK",
  "SHOOT", "SHORT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SIXTY", "SIZED", "SKILL", "SLEEP",
  "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND",
  "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPENT", "SPLIT", "SPOKE", "SPORT",
  "STAFF", "STAGE", "STAKE", "STAND", "START", "STATE", "STEAM", "STEEL", "STICK", "STILL",
  "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF",
  "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "TABLE", "TAKEN", "TASTE", "TAXES", "TEACH",
  "TEETH", "TERRY", "TEXAS", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE", "THICK",
  "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "TIGHT", "TIMES", "TIRED",
  "TITLE", "TODAY", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIN",
  "TREAT", "TREND", "TRIAL", "TRIED", "TRIES", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE",
  "UNDER", "UNDUE", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL",
  "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER",
  "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD",
  "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "WROTE", "YIELD",
  "YOUNG", "YOUTH"
];

export const TARGET_4_WORDS = [
  "ABLE", "ACID", "AGED", "ALSO", "AREA", "ARMY", "AWAY", "BABY", "BACK", "BALL",
  "BAND", "BANK", "BASE", "BATH", "BEAR", "BEAT", "BEEN", "BEER", "BELL", "BELT",
  "BEST", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BOMB", "BOND", "BONE", "BOOK",
  "BOOM", "BORN", "BOSS", "BOTH", "BOWL", "BULK", "BURN", "BUSH", "BUSY", "CALL",
  "CALM", "CAME", "CAMP", "CARD", "CARE", "CASE", "CASH", "CAST", "CELL", "CHAT",
  "CHIP", "CITY", "CLUB", "COAL", "COAT", "CODE", "COLD", "COME", "COOK", "COOL",
  "COPE", "COPY", "CORE", "COST", "CREW", "CROP", "DARK", "DATA", "DATE", "DAWN",
  "DAYS", "DEAD", "DEAL", "DEAN", "DEAR", "DEBT", "DEEP", "DENY", "DESK", "DIAL",
  "DIRT", "DISC", "DISK", "DOES", "DONE", "DOOR", "DOSE", "DOWN", "DRAW", "DREW",
  "DROP", "DRUG", "DUAL", "DUKE", "DUST", "DUTY", "EACH", "EARN", "EASE", "EAST",
  "EASY", "EDGE", "ELSE", "EVEN", "EVER", "EVIL", "EXIT", "FACE", "FACT", "FAIL",
  "FAIR", "FALL", "FARM", "FAST", "FATE", "FEAR", "FEED", "FEEL", "FEET", "FELL",
  "FELT", "FILE", "FILL", "FILM", "FIND", "FINE", "FIRE", "FIRM", "FISH", "FIVE",
  "FLAT", "FLOW", "FOOD", "FOOT", "FORD", "FORM", "FORT", "FOUR", "FREE", "FROM",
  "FUEL", "FULL", "FUND", "GAIN", "GAME", "GATE", "GAVE", "GEAR", "GENE", "GIFT",
  "GIRL", "GIVE", "GLAD", "GOAL", "GOES", "GOLD", "GOLF", "GONE", "GOOD", "GRAY",
  "GREW", "GROW", "GULF", "HAIR", "HALF", "HALL", "HAND", "HANG", "HARD", "HARM",
  "HATE", "HAVE", "HEAD", "HEAR", "HEAT", "HELD", "HELL", "HELP", "HERE", "HERO",
  "HIGH", "HILL", "HIRE", "HOLD", "HOLE", "HOLY", "HOME", "HOPE", "HOST", "HOUR",
  "HUGE", "HUNG", "HUNT", "HURT", "IDEA", "INCH", "INTO", "IRON", "ITEM", "JACK",
  "JANE", "JEAN", "JOHN", "JOIN", "JUMP", "JURY", "JUST", "KEEN", "KEEP", "KEPT",
  "KICK", "KILL", "KIND", "KING", "KNEE", "KNEW", "KNOW", "LACK", "LADY", "LAID",
  "LAKE", "LAND", "LANE", "LAST", "LATE", "LEAD", "LEFT", "LESS", "LIFE", "LIFT",
  "LIKE", "LINE", "LINK", "LION", "LIST", "LIVE", "LOAD", "LOAN", "LOCK", "LOGO",
  "LONG", "LOOK", "LORD", "LOSE", "LOSS", "LOST", "LOVE", "LUCK", "MADE", "MAIL",
  "MAIN", "MAKE", "MALE", "MANY", "MARK", "MASS", "MATT", "MEAL", "MEAN", "MEET",
  "MEND", "MENU", "MERE", "MIKE", "MILE", "MILK", "MILL", "MIND", "MINE", "MISS",
  "MODE", "MOOD", "MOON", "MORE", "MOST", "MOVE", "MUCH", "MUST", "NAME", "NAVY",
  "NEAR", "NECK", "NEED", "NEWS", "NEXT", "NICE", "NICK", "NINE", "NONE", "NOSE",
  "NOTE", "OKAY", "ONCE", "ONLY", "OPEN", "ORAL", "OVER", "PACE", "PACK", "PAGE",
  "PAID", "PAIN", "PAIR", "PALM", "PARK", "PART", "PASS", "PAST", "PATH", "PEAK",
  "PEER", "PICK", "PILE", "PINK", "PIPE", "PLAN", "PLAY", "PLOT", "PLUG", "PLUS",
  "POEM", "POET", "POLL", "POOL", "POOR", "PORT", "POST", "POUR", "PRAY", "PURE",
  "PUSH", "RACE", "RAIL", "RAIN", "RANK", "RARE", "RATE", "READ", "REAL", "REAR",
  "RELY", "RENT", "REST", "RICE", "RICH", "RIDE", "RING", "RISE", "RISK", "ROAD",
  "ROCK", "ROLE", "ROLL", "ROOF", "ROOM", "ROOT", "ROSE", "RULE", "RUSH", "RUTH",
  "SAFE", "SAID", "SAKE", "SALE", "SALT", "SAME", "SAND", "SAVE", "SEAT", "SEED",
  "SEEK", "SEEM", "SEEN", "SELF", "SELL", "SEND", "SENT", "SEPT", "SHIP", "SHOP",
  "SHOT", "SHOW", "SHUT", "SICK", "SIDE", "SIGN", "SITE", "SIZE", "SKIN", "SLIP",
  "SLOW", "SNOW", "SOFT", "SOIL", "SOLD", "SOLE", "SOME", "SONG", "SOON", "SORT",
  "SOUL", "SPOT", "STAR", "STAY", "STEP", "STOP", "SUCH", "SUIT", "SURE", "TAKE",
  "TALE", "TALK", "TALL", "TANK", "TAPE", "TASK", "TEAM", "TECH", "TELL", "TEND",
  "TERM", "TEST", "TEXT", "THAN", "THAT", "THEM", "THEN", "THEY", "THIN", "THIS",
  "THOU", "TIDE", "TILL", "TIME", "TINY", "TOLD", "TOLL", "TONE", "TOOK", "TOOL",
  "TOUR", "TOWN", "TREE", "TRIP", "TRUE", "TUNE", "TURN", "TWIN", "TYPE", "UNIT",
  "UPON", "USED", "USER", "VARY", "VAST", "VERY", "VICE", "VIEW", "VOTE", "WAGE",
  "WAIT", "WAKE", "WALK", "WALL", "WANT", "WARM", "WARN", "WASH", "WAVE", "WAYS",
  "WEAK", "WEAR", "WEEK", "WELL", "WENT", "WERE", "WEST", "WHAT", "WHEN", "WHOM",
  "WIDE", "WIFE", "WILD", "WILL", "WIND", "WINE", "WING", "WIPE", "WIRE", "WISE",
  "WISH", "WITH", "WOOD", "WORD", "WORK", "YARD", "YEAH", "YEAR", "YOUR", "ZERO", "ZONE"
];

export const TARGET_6_WORDS = [
  "ACTION", "ADVICE", "AFRAID", "AGENCY", "ALMOST", "ALWAYS", "AMOUNT", "ANIMAL", "ANNUAL", "ANSWER",
  "APPEAL", "APPEAR", "AROUND", "ARRIVE", "ARTIST", "ASPECT", "ASSIST", "ATTACK", "ATTEND", "AUTHOR",
  "AVENUE", "BATTLE", "BEAUTY", "BECOME", "BEFORE", "BEHIND", "BELIEF", "BELONG", "BESIDE", "BETTER",
  "BEYOND", "BISHOP", "BORDER", "BORROW", "BOTTLE", "BOTTOM", "BOUGHT", "BRANCH", "BREATH", "BRIDGE",
  "BRIGHT", "BROKEN", "BUDGET", "BURDEN", "BUREAU", "BUTTON", "CAMERA", "CANCER", "CANNOT", "CARBON",
  "CAREER", "CASTLE", "CASUAL", "CAUGHT", "CENTER", "CHANCE", "CHANGE", "CHARGE", "CHOICE", "CHOOSE",
  "CHURCH", "CIRCLE", "CLIENT", "CLOSED", "CLOSER", "COFFEE", "COLUMN", "COMBAT", "COMMON", "CORNER",
  "COSTLY", "COUNTY", "COUPLE", "COURSE", "CREDIT", "CRISIS", "CUSTOM", "DAMAGE", "DANGER", "DEALER",
  "DEBATE", "DECIDE", "DEFEAT", "DEFEND", "DEGREE", "DEMAND", "DEPEND", "DEPUTY", "DESERT", "DESIGN",
  "DESIRE", "DETAIL", "DETECT", "DEVICE", "DIFFER", "DINNER", "DIRECT", "DOCTOR", "DOLLAR", "DOMAIN",
  "DOUBLE", "DRIVEN", "DRIVER", "DURING", "EASILY", "EATING", "EDITOR", "EFFECT", "EFFORT", "EIGHTH",
  "EITHER", "ELEVEN", "EMERGE", "EMPIRE", "EMPLOY", "ENABLE", "ENDING", "ENERGY", "ENGAGE", "ENGINE",
  "ENOUGH", "ENSURE", "ENTIRE", "ENTITY", "EQUITY", "ESCAPE", "ESTATE", "ETHNIC", "EXCEED", "EXCEPT",
  "EXCUSE", "EXPAND", "EXPECT", "EXPERT", "EXPORT", "EXTEND", "EXTENT", "FABRIC", "FACTOR", "FAILED",
  "FAIRLY", "FAMILY", "FAMOUS", "FARMER", "FATHER", "FELLOW", "FEMALE", "FIGURE", "FILING", "FINGER",
  "FINISH", "FLIGHT", "FLOWER", "FLYING", "FOLLOW", "FORCED", "FOREST", "FORGET", "FORMAL", "FORMAT",
  "FORMER", "FOSTER", "FOUGHT", "FOURTH", "FREEZE", "FRIEND", "FUTURE", "GARDEN", "GATHER", "GENDER",
  "GERMAN", "GLOBAL", "GOLDEN", "GROUND", "GROWTH", "GUILTY", "HANDLE", "HAPPEN", "HARDLY", "HEADED",
  "HEALTH", "HEARING", "HEAVEN", "HEIGHT", "HELPED", "HIDDEN", "HOLDER", "HONEST", "IMPACT", "IMPORT",
  "INCOME", "INDEED", "INSIDE", "INTEND", "INVEST", "ISLAND", "ITSELF", "JACKET", "JERSEY", "JOSEPH",
  "JUNIOR", "KILLED", "LABOR", "LACKED", "LATEST", "LATTER", "LAUNCH", "LAWYER", "LEADER", "LEAGUE",
  "LEAVES", "LEGACY", "LENGTH", "LESSON", "LETTER", "LIGHTS", "LIKELY", "LINKED", "LIQUID", "LISTEN",
  "LITTLE", "LIVING", "LOCATE", "LONELY", "LOVELY", "LUXURY", "MAINLY", "MAKING", "MANAGE", "MANNER",
  "MANUAL", "MARGIN", "MARINE", "MARKED", "MARKET", "MARTIN", "MASTER", "MATTER", "MATURE", "MEDIUM",
  "MEMBER", "MEMORY", "MENTAL", "MERELY", "MERGER", "METHOD", "MIDDLE", "MILLER", "MINING", "MINUTE",
  "MIRROR", "MOBILE", "MODERN", "MODIFY", "MODULE", "MOMENT", "MORTAL", "MOSTLY", "MOTHER", "MOTION",
  "MOVING", "MURDER", "MUSEUM", "MUTUAL", "MYSELF", "NATION", "NATIVE", "NATURE", "NEARBY", "NEARLY",
  "NEEDLE", "NELSON", "NEPHEW", "NORMAL", "NOTICE", "NUMBER", "OBJECT", "OBTAIN", "OFFICE", "OFFSET",
  "ONLINE", "OPTION", "ORANGE", "ORIGIN", "OUTPUT", "PALACE", "PARENT", "PARTLY", "PATENT", "PATROL",
  "PAYING", "PEOPLE", "PERIOD", "PERMIT", "PERSON", "PHRASE", "PICKED", "PLANET", "PLAYER", "PLEASE",
  "PLENTY", "POCKET", "POLICE", "POLICY", "POORLY", "POSTED", "POWDER", "PRAISE", "PRAYER", "PREFER",
  "PRETTY", "PRINCE", "PRISON", "PROFIT", "PROMPT", "PROPER", "PROVE", "PUBLIC", "PURSUE", "PUZZLE",
  "QUICKLY", "RACING", "RANDOM", "RARELY", "RATING", "READER", "REALLY", "REASON", "RECALL", "RECENT",
  "RECORD", "REDUCE", "REFORM", "REGARD", "REGIME", "REGION", "RELATE", "RELIEF", "REMAIN", "REMOTE",
  "REMOVE", "REPAIR", "REPEAT", "REPORT", "RESCUE", "RESIGN", "RESIST", "RESORT", "RESULT", "RETAIL",
  "RETAIN", "RETURN", "REVEAL", "REVIEW", "REWARD", "RIDING", "RISING", "ROBUST", "ROLLER", "ROMAN",
  "RUNNER", "RUNNING", "SACRED", "SAFETY", "SALARY", "SAMPLE", "SAVING", "SCHEME", "SCHOOL", "SCREEN",
  "SEARCH", "SEASON", "SECOND", "SECRET", "SECTOR", "SECURE", "SEEING", "SELDOM", "SELECT", "SENIOR",
  "SERIES", "SETTLE", "SEVERE", "SHADOW", "SHARED", "SHIELD", "SIGNAL", "SILENT", "SILVER", "SIMPLE",
  "SIMPLY", "SINCERE", "SINGLE", "SISTER", "SKETCH", "SLIGHT", "SMOOTH", "SOCIAL", "SOLELY", "SOUGHT",
  "SOURCE", "SOVIET", "SPEECH", "SPIRIT", "SPREAD", "SPRING", "SQUARE", "STABLE", "STATUS", "STEADY",
  "STOLEN", "STRAIN", "STREAM", "STREET", "STRESS", "STRICT", "STRIKE", "STRING", "STRONG", "STRUCK",
  "STUDIO", "SUBMIT", "SUDDEN", "SUFFER", "SUMMER", "SUMMIT", "SUPPLY", "SURELY", "SURVEY", "SWITCH",
  "SYMBOL", "SYSTEM", "TAKING", "TALENT", "TARGET", "TASTED", "TAUGHT", "TENANT", "TENDER", "TENNIS",
  "THANKS", "THEORY", "THIRTY", "THREAT", "TIMING", "TISSUE", "TOILET", "TONGUE", "TOWARD", "TRAGIC",
  "TRAVEL", "TREATY", "TRIBAL", "TRIPLE", "TROPHY", "TUNNEL", "TWELVE", "TWENTY", "TYPING", "UNABLE",
  "UNIQUE", "UNITED", "UNLESS", "UNLIKE", "UPDATE", "USEFUL", "VALLEY", "VALUED", "VARIED", "VENDOR",
  "VICTIM", "VICTOR", "VIEWER", "VIRTUE", "VISION", "VISUAL", "VOLUME", "VOTING", "WALKER", "WALLED",
  "WANTED", "WARNING", "WEALTH", "WEAPON", "WEEKLY", "WEIGHT", "WHEELS", "WINDOW", "WINNER", "WINTER",
  "WISDOM", "WONDER", "WORKER", "WRITER", "YELLOW", "ZEALOT"
];

export class LocalWordleEngine {
  static evaluateGuess(guess, target) {
    const g = guess.trim().toUpperCase();
    const t = target.trim().toUpperCase();
    const len = t.length;
    const result = new Array(len).fill('absent');
    const targetLetterCounts = {};

    for (let i = 0; i < len; i++) {
      if (g[i] === t[i]) {
        result[i] = 'correct';
      } else {
        targetLetterCounts[t[i]] = (targetLetterCounts[t[i]] || 0) + 1;
      }
    }

    for (let i = 0; i < len; i++) {
      if (result[i] !== 'correct') {
        const char = g[i];
        if (targetLetterCounts[char] && targetLetterCounts[char] > 0) {
          result[i] = 'present';
          targetLetterCounts[char]--;
        }
      }
    }

    return result;
  }

  static getWordList(length = 5) {
    if (length === 4) return TARGET_4_WORDS;
    if (length === 6) return TARGET_6_WORDS;
    return TARGET_5_WORDS;
  }

  static getDailyWord(length = 5) {
    const dateStr = new Date().toISOString().slice(0, 10);
    const list = this.getWordList(length);
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash * 31 + dateStr.charCodeAt(i) + length * 17) % list.length;
    }
    return list[Math.abs(hash) % list.length];
  }

  static getRandomWord(length = 5) {
    const list = this.getWordList(length);
    return list[Math.floor(Math.random() * list.length)];
  }

  static filterCandidates(candidates, guess, pattern) {
    return candidates.filter(w => {
      const evalPat = this.evaluateGuess(guess, w);
      return evalPat.every((val, idx) => val === pattern[idx]);
    });
  }

  static calculateEntropy(guess, possibleWords) {
    if (!possibleWords || possibleWords.length === 0) return 0;
    const total = possibleWords.length;
    const patternBuckets = {};

    for (const word of possibleWords) {
      const patKey = this.evaluateGuess(guess, word).join(',');
      patternBuckets[patKey] = (patternBuckets[patKey] || 0) + 1;
    }

    let entropy = 0;
    for (const count of Object.values(patternBuckets)) {
      const p = count / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    return Number(entropy.toFixed(3));
  }

  static getTopRecommendations(history, length = 5, maxResults = 5) {
    let candidates = [...this.getWordList(length)];
    for (const turn of history) {
      if (turn.guess && turn.result) {
        candidates = this.filterCandidates(candidates, turn.guess, turn.result);
      }
    }

    const totalPossible = candidates.length;
    if (totalPossible <= 2) {
      return {
        remainingCount: totalPossible,
        recommendations: candidates.map(w => ({
          word: w,
          entropy: totalPossible === 2 ? 1.0 : 0.0,
          winProbability: Number((1.0 / totalPossible).toFixed(3)),
          score: 100,
          isPossibleAnswer: true
        }))
      };
    }

    const sample = candidates.slice(0, 80);
    const scored = sample.map(w => {
      const ent = this.calculateEntropy(w, candidates);
      return {
        word: w,
        entropy: ent,
        winProbability: Number((1.0 / totalPossible).toFixed(3)),
        score: Number((ent + 0.5).toFixed(2)),
        isPossibleAnswer: true
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return {
      remainingCount: totalPossible,
      recommendations: scored.slice(0, maxResults)
    };
  }
}

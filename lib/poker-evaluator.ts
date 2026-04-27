// Poker hand evaluator for calculating win probabilities
// Fixed: CARD_VALUES object now has proper quotes on all keys (T, J, Q, K, A)

export interface Card {
  code: string; // e.g., "2C", "AH"
  value: string; // "2"-"9", "T", "J", "Q", "K", "A"
  suit: string; // "C", "D", "H", "S"
}

export interface HandResult {
  player: number;
  hand: Card[];
  rank: HandRank;
  score: number;
}

export interface HandRank {
  name: string;
  value: number;
  tiebreaker: number[];
}

const RANK_VALUES = {
  "High Card": 0,
  "One Pair": 1,
  "Two Pair": 2,
  "Three of a Kind": 3,
  Straight: 4,
  Flush: 5,
  "Full House": 6,
  "Four of a Kind": 7,
  "Straight Flush": 8,
  "Royal Flush": 9,
};

const CARD_VALUES: { [key: string]: number } = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "J": 11,
  "Q": 12,
  "K": 13,
  "A": 14,
};

export function getCardValue(card: Card): number {
  return CARD_VALUES[card.value];
}

export function evaluateHand(cards: Card[]): HandRank {
  if (cards.length < 5) {
    return { name: "High Card", value: 0, tiebreaker: [] };
  }

  const sorted = [...cards].sort(
    (a, b) => getCardValue(b) - getCardValue(a)
  );

  // Check for flush
  const isFlush = checkFlush(sorted);

  // Check for straight
  const isStraight = checkStraight(sorted);

  // Count values
  const valueCounts = getValueCounts(sorted);
  const counts = Object.values(valueCounts).sort((a, b) => b - a);

  if (isFlush && isStraight) {
    const highCard = getCardValue(sorted[0]);
    if (highCard === 14 && getCardValue(sorted[1]) === 13) {
      return {
        name: "Royal Flush",
        value: RANK_VALUES["Royal Flush"],
        tiebreaker: [14],
      };
    }
    return {
      name: "Straight Flush",
      value: RANK_VALUES["Straight Flush"],
      tiebreaker: [highCard],
    };
  }

  if (counts[0] === 4) {
    return {
      name: "Four of a Kind",
      value: RANK_VALUES["Four of a Kind"],
      tiebreaker: getSortedCounts(valueCounts),
    };
  }

  if (counts[0] === 3 && counts[1] === 2) {
    return {
      name: "Full House",
      value: RANK_VALUES["Full House"],
      tiebreaker: getSortedCounts(valueCounts),
    };
  }

  if (isFlush) {
    return {
      name: "Flush",
      value: RANK_VALUES["Flush"],
      tiebreaker: sorted.slice(0, 5).map(getCardValue),
    };
  }

  if (isStraight) {
    return {
      name: "Straight",
      value: RANK_VALUES["Straight"],
      tiebreaker: [getCardValue(sorted[0])],
    };
  }

  if (counts[0] === 3) {
    return {
      name: "Three of a Kind",
      value: RANK_VALUES["Three of a Kind"],
      tiebreaker: getSortedCounts(valueCounts),
    };
  }

  if (counts[0] === 2 && counts[1] === 2) {
    return {
      name: "Two Pair",
      value: RANK_VALUES["Two Pair"],
      tiebreaker: getSortedCounts(valueCounts),
    };
  }

  if (counts[0] === 2) {
    return {
      name: "One Pair",
      value: RANK_VALUES["One Pair"],
      tiebreaker: getSortedCounts(valueCounts),
    };
  }

  return {
    name: "High Card",
    value: RANK_VALUES["High Card"],
    tiebreaker: sorted.slice(0, 5).map(getCardValue),
  };
}

function checkFlush(cards: Card[]): boolean {
  const suitCount: { [key: string]: number } = {};
  for (const card of cards) {
    suitCount[card.suit] = (suitCount[card.suit] || 0) + 1;
    if (suitCount[card.suit] >= 5) return true;
  }
  return false;
}

function checkStraight(cards: Card[]): boolean {
  const values = cards.map(getCardValue).sort((a, b) => b - a);
  let streak = 1;
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] === 1) {
      streak++;
      if (streak >= 5) return true;
    } else if (values[i] !== values[i + 1]) {
      streak = 1;
    }
  }

  // Check for A-2-3-4-5 (wheel)
  if (
    values.includes(14) &&
    values.includes(2) &&
    values.includes(3) &&
    values.includes(4) &&
    values.includes(5)
  ) {
    return true;
  }

  return false;
}

function getValueCounts(cards: Card[]): { [key: number]: number } {
  const counts: { [key: number]: number } = {};
  for (const card of cards) {
    const val = getCardValue(card);
    counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}

function getSortedCounts(valueCounts: { [key: number]: number }): number[] {
  return Object.entries(valueCounts)
    .map(([value, count]) => ({ value: parseInt(value), count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.value - a.value;
    })
    .map((x) => x.value);
}

export function compareHands(
  hand1: Card[],
  hand2: Card[]
): number {
  const rank1 = evaluateHand(hand1);
  const rank2 = evaluateHand(hand2);

  if (rank1.value !== rank2.value) {
    return rank1.value - rank2.value;
  }

  for (let i = 0; i < Math.max(rank1.tiebreaker.length, rank2.tiebreaker.length); i++) {
    const tb1 = rank1.tiebreaker[i] || 0;
    const tb2 = rank2.tiebreaker[i] || 0;
    if (tb1 !== tb2) return tb1 - tb2;
  }

  return 0;
}

export function calculateEquity(
  playerHoleCards: Card[][],
  communityCards: Card[],
  simulationCount: number = 10000
): number[] {
  const allDealtCards = new Set(
    [...playerHoleCards.flat(), ...communityCards].map((c) => c.code)
  );
  const remainingCards = getAllCards().filter((c) => !allDealtCards.has(c.code));

  let playerWins = new Array(playerHoleCards.length).fill(0);

  for (let i = 0; i < simulationCount; i++) {
    const simCards = [...remainingCards].sort(() => Math.random() - 0.5);
    const cardsNeeded = 5 - communityCards.length;
    const simCommunity = [...communityCards, ...simCards.slice(0, cardsNeeded)];

    const handResults = playerHoleCards.map((holeCards, playerIdx) => {
      const allCards = [...holeCards, ...simCommunity];
      const hand = getBestHand(allCards);
      return { playerIdx, hand, rank: evaluateHand(hand) };
    });

    // Find the actual best hand first
    let bestResult = handResults[0];
    for (const result of handResults) {
      if (compareHands(result.hand, bestResult.hand) > 0) {
        bestResult = result;
      }
    }

    // Find all players with the best hand (to handle ties)
    const tiedPlayers = handResults.filter((result) =>
      compareHands(result.hand, bestResult.hand) === 0
    );

    // Distribute win credit equally among tied players
    const winShare = 1 / tiedPlayers.length;
    tiedPlayers.forEach((player) => {
      playerWins[player.playerIdx] += winShare;
    });
  }

  return playerWins.map((wins) => (wins / simulationCount) * 100);
}

export function evaluateRiverWinner(
  playerHoleCards: Card[][],
  communityCards: Card[]
): number[] {
  if (communityCards.length !== 5) {
    return calculateEquity(playerHoleCards, communityCards, 100);
  }

  const handResults = playerHoleCards.map((holeCards, playerIdx) => {
    const allCards = [...holeCards, ...communityCards];
    const hand = getBestHand(allCards);
    return { playerIdx, hand, rank: evaluateHand(hand) };
  });

  // Find the actual best hand first
  let bestResult = handResults[0];
  for (const result of handResults) {
    if (compareHands(result.hand, bestResult.hand) > 0) {
      bestResult = result;
    }
  }

  // Find all players with the best hand (to handle ties)
  const tiedPlayers = handResults.filter((result) =>
    compareHands(result.hand, bestResult.hand) === 0
  );

  // Distribute probability equally among tied players
  const result = new Array(playerHoleCards.length).fill(0);
  const probabilityPerPlayer = 100 / tiedPlayers.length;
  tiedPlayers.forEach((player) => {
    result[player.playerIdx] = probabilityPerPlayer;
  });

  return result;
}

function getBestHand(cards: Card[]): Card[] {
  if (cards.length <= 5) return cards;

  let bestHand = cards.slice(0, 5);
  let bestRank = evaluateHand(bestHand);

  // Try all 5-card combinations (C(7,5) = 21 combinations for Texas Hold'em)
  for (let i = 0; i < cards.length - 4; i++) {
    for (let j = i + 1; j < cards.length - 3; j++) {
      for (let k = j + 1; k < cards.length - 2; k++) {
        for (let l = k + 1; l < cards.length - 1; l++) {
          for (let m = l + 1; m < cards.length; m++) {
            const hand = [cards[i], cards[j], cards[k], cards[l], cards[m]];
            const rank = evaluateHand(hand);
            if (compareHands(hand, bestHand) > 0) {
              bestHand = hand;
              bestRank = rank;
            }
          }
        }
      }
    }
  }

  return bestHand;
}

function getAllCards(): Card[] {
  const suits = ["C", "D", "H", "S"];
  const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const cards: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      cards.push({
        code: (value === "10" ? "10" : value) + suit,
        value,
        suit,
      });
    }
  }

  return cards;
}

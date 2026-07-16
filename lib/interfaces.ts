/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
    bids_received: number;
    status: string;
    role: string;
    verified: boolean;
    username: string;
    user_id: string;
    name: string;
    email: string;
    image_url: string;
    bio: string;
    join_date: string;
    money: number;
    total_deposits: number;
    total_withdrawals: number;
    spent_on_bids: number;
    total_auctions: number;
    total_bids: number;
    auctions_participated: number;
    auctions_won: number;
    win_rate: number;
    is_admin: boolean;
    is_suspended: boolean;
}

export interface Auction {
    bid_history: any;
    views: number;
    auction_id: string;
    auction_type: string;
    user_id?: string;
    creator: string;
    item_name: string;
    description: string;
    category: "electronics" | "art" | "fashion" | "vehicles" | "other";
    starting_price: number;
    buy_now?: number;
    highest_bid?: number;
    highest_bidder_id?: string;
    highest_bidder_name?: string;
    total_bids: string;
    created_at: string;
    start_time: string;
    end_time: string;
    participants: string;
    status?: string;
    images?: string[];
    condition: "new" | "used" | "refurbished";
    isFavorite?: boolean;
    top_bidders?: Array<{
        name: string;
        avatar: string;
        amount: number;
    }>;
}

export interface Bid {
    bid_id?: number;
    auction_id?: string;
    user_id?: string;
    item_name: string;
    bid_amount: number;
    created_at?: string;
}

export interface PastAuctionCardProps {
    auction: Auction;
}

export interface UpcomingAuctionCardProps {
    auction: {
        auction_id: string;
        item_name: string;
        description: string;
        images: string[];
        start_time: string;
        end_time: string;
        starting_price: number;
        status: "upcoming" | "live" | "ended";
        highest_bid: number | null;
        highest_bidder_id: number | null;
        creator: string;
        category: string;
        condition: "New" | "Used";
    };
    auctionCreator: string;
}

export interface AuctionDetailsProps {
    seller: {
        name: string;
        image: string;
    };
    title: string;
    description: string;
    currentBid: number;
    startingBid: number;
    condition: string;
    categories: string;
    endTime: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
}

export interface AuctionTabsProps {
    bidHistory: Bid[];
    reviews: {
        reviewer: {
            name: string;
            image: string;
        };
        date: string;
        rating: number;
        comment: string;
    }[];
}

export interface BiddingSectionProps {
    currentBid: number;
    onBid: (amount: number) => void;
}
export interface AuctionCardProps {
    auction: Auction;
    auctionCreator: string;
    isFavourited: boolean;
    user: User;
    loggedIn: boolean;
    onPaymentSuccess?: () => void;
}

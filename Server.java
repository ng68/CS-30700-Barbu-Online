import classes.*;
import java.util.ArrayList;

public class Server {
    private static final int OK = 1;
    private static final int ERROR = 0;

    private ArrayList<User> onlineUsers;
    private Chat globalChat;

    public static void main(String[] args) {
        test();
    }

    private static void test() {
        Server s = new Server();

        s.userLoggedIn("Bob");
        s.userLoggedIn("Sam");
        s.userLoggedIn("Jessica");

        s.changeUsername("Jessica", "Josie");

        s.addFriend("Josie", "Bob");
        s.addFriend("Josie", "Sam");

        System.out.println("\nFriend add/login/name change trial:");
        s.printStatus();

        s.sendMessage("Josie", "Hey Bob");
        s.sendMessage("Bob", "Hello Josie");
        s.sendMessage("Josie", "Bob we can't be friends anymore.");
        s.sendMessage("Bob", "What???");

        System.out.println("\nChat messages trial:");
        s.printStatus();

        s.removeFriend("Josie", "Bob");

        System.out.println("\nFriend removal trial:");
        s.printStatus();

        s.userLoggedOut("Josie");
        s.userLoggedOut("Bob");

        System.out.println("\nUsers logged out trial:");
        s.printStatus();
    }

    public Server() {
        this.onlineUsers = new ArrayList<User>();
        this.globalChat = new Chat(new User[] {});
    }

    private void printStatus() {
        // Method used in unit testing of Server class. Prints chat, users, friends, etc.

        System.out.println("Users:\nFriends");
        System.out.println("...");
        for (User u : onlineUsers) {
            System.out.println(u.get_username() + ":");

            for (User f : u.get_friends()) {
                System.out.println(f.get_username());
            }
        }

        System.out.println("Chat participants:");
        for (User u : globalChat.get_participants()) {
            System.out.println(u.get_username());
        }

        System.out.println("Chat log:");
        for (Message m : globalChat.get_messages()) {
            System.out.println(m.get_sender().get_username() + " sent " + m.get_content());
        }
    }

    private User getUserFromUsername(String username) {
        // Find user in onlineUsers with the username.
        // Can this be done more efficiently?
        for (User u : onlineUsers) {
            if (u.get_username().equals(username)) {
                return u;
            }
        }

        return null;
    }

    private int userSignedUp(String username) {
        // Create an entry for the user in the firebase database.
        // Initialize all the fields to 0 since it's a brand new user.
        // The new user's username is passed as an argument.
        // If something goes wrong return ERROR

        // Initialize user object. Used the second constructor since
        // we can just initialize all of the fields to 0.
        User newUser = new User(username);

        // Add user to list of online users
        onlineUsers.add(newUser);
        globalChat.add_participant(newUser);

        return OK;
    }

    private int userLoggedIn(String username) {
        // Scan firebase for user's details. This will be a user who has
        // previously used the website before so they should have an entry
        // in the database. Can get their username from the argument.
        // Need to fill out the following variables:

        int wins = 0;
        int losses = 0;
        double winPercentage = 0;
        double averageScore = 0;
        ArrayList<User> friends = new ArrayList<User>();

        // For the array list of friends, I think what you will need to do
        // is loop through all of the user's friends on firebase. For each one,
        // run getUserFromUsername(username) with the friend's username. If that
        // method returns null, then that friend is not currently online, so
        // do NOT add them to the array list. If the method returns a User object
        // instead of null, then you can add them to the array list.
        
        // If something goes wrong return ERROR

        // Create user object from the details found in firebase
        User newUser = new User(username, wins, losses, winPercentage, averageScore, friends);

        // Add user to list of online users
        onlineUsers.add(newUser);
        globalChat.add_participant(newUser);

        return OK;
    }

    private int userLoggedOut(String username) {
        User loggedOutUser = getUserFromUsername(username);

        // Need to update the user's statistics in the database here. You
        // can find them in the database either with the username (one of
        // the method's parameters) or with anything in the user object
        // (loggedOutUser). The following need to be updated:
        //      - wins
        //      - losses
        //      - win percentage
        //      - average score
        //      - friends list
        //
        // If anything goes wrong with that, return ERROR.

        if (loggedOutUser == null) {
            return ERROR;
        }

        onlineUsers.remove(loggedOutUser);
        globalChat.remove_participant(loggedOutUser);

        return OK;
    }

    private int changeUsername(String currentUsername, String futureUsername) {
        User u = getUserFromUsername(currentUsername);

        // Need to update the user's username in firebase. Both the current
        // username and the new username are passed as arguments to the
        // function, and there's also the user object u that gets instantiated
        // above. If anything goes wrong return ERROR.

        if (u == null) {
            return ERROR;
        }

        u.set_username(futureUsername);

        return OK;
    }

    private int addFriend(String username, String newFriendUsername) {
        // Need to use firebase in this function as well, explained below.
        // You have access to both the user's username and the friend
        // they are adding's username.

        User adder = getUserFromUsername(username);
        User addee = getUserFromUsername(newFriendUsername);

        if (adder == null) {
            // The adder isn't logged in.
            return ERROR;
        }

        if (addee == null) {
            // The friend isn't logged in, therefore we cannot add them
            // to the User object's friend list because they are a null
            // user.

            // Still need to use firebase to add the friend. Can use
            // newFriendUsername to find them in the database. If there
            // is an error or that person doesn't exist, return ERROR.
            // If everything goes fine return OK. Do not let the program
            // exit this if statement though, you must return before the
            // if-block ends because the code below shouldn't execute.

            return OK;
        }

        // Also user firebase here to add the friend to the user's friends
        // list. This part of the code is the case where both the user
        // and the new friend are logged in. That's why I can do
        // adder.add_friend() below. If something goes wrong with the
        // firebase, return ERROR.

        adder.add_friend(addee);
        return OK;
    }

    private int removeFriend(String username, String removedUsername) {
        // Update user with the deleted friend in the firebase database

        User deleter = getUserFromUsername(username);
        User deletee = getUserFromUsername(removedUsername);

        if (deleter == null) {
            // The user making the deletion isn't logged in.
            return ERROR;
        }
        
        if (deletee == null) {
            // The friend getting deleted either doesn't exist
            // or is not logged in. Use firebase to find the person
            // (the username is removedUsername) and remove them from
            // the user's friend list. If something goes wrong or
            // the friend doesn't exist return ERROR. If everything works
            // return OK. Don't let the program escape this if-block
            // without returning; see addFriend.

            return OK;
        }

        // The friend exists and is logged in. Still need to update
        // the firebase database to remove them from the user's
        // friend list in permanent storage. If something goes wrong
        // return ERROR.

        deleter.remove_friend(deletee);
        return OK;
    }

    private int sendMessage(String username, String content) {
        User sender = getUserFromUsername(username);

        if (sender == null) {
            return ERROR;
        }

        Message message = new Message(sender, content);
        globalChat.add_message(message);
        return OK;
    }

    private int updateClientChats() {
        // TODO!!! This will be called after sendMessage, if sendMessage returns OK.

        return OK;
    }

    private int sendStatistics(String username) {
        User u = getUserFromUsername(username);

        // TODO send statistics from u

        return OK;
    }

    private int sendLeaderboard() {
        
        // This function will need firebase. I'm still not exactly sure
        // of the protocol we will be using so you don't have to worry about this
        // for now. But in the future it will basically need to pull the stats of
        // all the users from the database and send them to the client so they
        // can view the leaderboard.

        return OK;
    }
}
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

    private int userSignedUp(String username) {
        // Create an entry for the user in the firebase database

        // If something goes wrong return ERROR

        // Initialize user object (can just be all 0's since they are new)
        User newUser = new User(username); // TODO: Add other args when they're added to class

        // Add user to list of online users
        onlineUsers.add(newUser);
        globalChat.add_participant(newUser);

        return OK;
    }

    private int userLoggedIn(String username) {
        // Scan firebase for user's details

        // If something goes wrong return ERROR

        // Create user object from the details found in firebase
        User newUser = new User(username); // TODO: Add other args when they're added to class

        // Add user to list of online users
        onlineUsers.add(newUser);
        globalChat.add_participant(newUser);

        return OK;
    }

    private int userLoggedOut(String username) {
        // Update user's data in firebase?

        // Find user in onlineUsers with the username.
        // Can this be done more efficiently?
        for (User u : onlineUsers) {
            if (u.get_username().equals(username)) {
                onlineUsers.remove(u);
                globalChat.remove_participant(u);

                // Any other code that is necessary to clean up user

                return OK;
            }
        }

        return ERROR;
    }

    private int changeUsername(String currentUsername, String futureUsername) {
        // Update user in firebase database

        // Find user in onlineUsers with the username.
        // Can this be done more efficiently?
        for (User u : onlineUsers) {
            if(u.get_username().equals(currentUsername)) {
                u.set_username(futureUsername);

                // Any other code that is necessary

                return OK;
            }
        }

        return ERROR;
    }

    private int addFriend(String username, String newFriendUsername) {
        // Update user with the new friend in the firebase database

        // Find user in onlineUsers with the username,
        // then find friend with the username
        // Can this be done more efficiently?
        User adder = null;
        for (User u : onlineUsers) {
            if (u.get_username().equals(username)) {
                adder = u;
            }
        }

        User addee = null;
        for (User u : onlineUsers) {
            if (u.get_username().equals(newFriendUsername)) {
                addee = u;
            }
        }

        if ((adder == null) || (addee == null)) {
            return ERROR;
        }

        adder.add_friend(addee);

        return OK;
    }

    private int removeFriend(String username, String removedUsername) {
        // Update user with the deleted friend in the firebase database

        // Find user in onlineUsers with the username,
        // then find friend with the username
        // Can this be done more efficiently?
        User deleter = null;
        for (User u : onlineUsers) {
            if (u.get_username().equals(username)) {
                deleter = u;
            }
        }

        User deletee = null;
        for (User u : onlineUsers) {
            if (u.get_username().equals(removedUsername)) {
                deletee = u;
            }
        }

        if ((deleter == null) || (deletee == null)) {
            return ERROR;
        }

        deleter.remove_friend(deletee);

        return OK;
    }

    private int sendMessage(String username, String content) {
        // Find user in onlineUsers with the username.
        // Can this be done more efficiently?
        User sender = null;
        for (User u : onlineUsers) {
            if (u.get_username().equals(username)) {
                sender = u;
            }
        }

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
}
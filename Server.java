import classes.User;
import java.util.ArrayList;

public class Server {
    private static final int OK = 1;
    private static final int ERROR = 0;

    private ArrayList<User> onlineUsers;

    public static void main(String[] args) {
        Server s = new Server();

        s.userLoggedIn("Bob");
        s.userLoggedIn("Sam");
        s.userLoggedIn("Jessica");

        s.changeUsername("Jessica", "Josie");

        s.addFriend("Josie", "Bob");
        s.addFriend("Josie", "Sam");
        
        System.out.println("First trial:");
        s.printUsersAndFriends();

        s.removeFriend("Josie", "Sam");

        System.out.println("Second trial:");
        s.printUsersAndFriends();

        s.userLoggedOut("Josie");

        System.out.println("Third trial:");
        s.printUsersAndFriends();
    }

    public Server() {
        this.onlineUsers = new ArrayList<User>();
    }

    private void printUsersAndFriends() {
        // Method used in unit testing of Server class

        for (User u : onlineUsers) {
            System.out.println(u.get_username() + ":");

            for (User f : u.get_friends()) {
                System.out.println(f.get_username());
            }
        }
    }

    private int userSignedUp(String username) {
        // Create an entry for the user in the firebase database

        // If something goes wrong return ERROR

        // Initialize user object (can just be all 0's since they are new)
        User newUser = new User(username); // TODO: Add other args when they're added to class

        // Add user to list of online users
        onlineUsers.add(newUser);

        return OK;
    }

    private int userLoggedIn(String username) {
        // Scan firebase for user's details

        // If something goes wrong return ERROR

        // Create user object from the details found in firebase
        User newUser = new User(username); // TODO: Add other args when they're added to class

        // Add user to list of online users
        onlineUsers.add(newUser);

        return OK;
    }

    private int userLoggedOut(String username) {
        // Update user's data in firebase?

        // Find user in onlineUsers with the username.
        // Can this be done more efficiently?
        for (User u : onlineUsers) {
            if (u.get_username().equals(username)) {
                onlineUsers.remove(u);

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
}
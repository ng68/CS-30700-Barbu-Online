import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;

public class Chat {
	public ArrayList<User> participants;
	public ArrayList<Message> messages;
	
	public Chat(User[] participants) {
		this.participants = new ArrayList<User>(Arrays.asList(participants));
		messages = new ArrayList<Message>();
	}
	
	public void add_message(Message m) {
		if(m.content != "" && participants.contains(m.sender)) {
			messages.add(m);
		}
	}
	
	public void add_participant(User u) {
		participants.add(u);
	}
	
	public void remove_participant(User u) {
		participants.remove(u);
	}
}
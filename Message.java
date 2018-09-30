import java.util.Date;

public class Message {
	User sender;
	String content;
	Date time;
	
	public Message(User sender, String content) {
		this.sender = sender;
		this.content = content;
		this.time = new Date();
	}
}
import java.util.ArrayList;

public class User {
	public String username;
	public int wins;
	public int losses;
	public double win_pct;
	public double avg_score;
	public ArrayList<User> friends;
	
	public User(String username) {
		this.username = username;
		this.wins = 0;
		this.losses = 0;
		this.win_pct = 0.0;
		this.avg_score = 0.0;
		this.friends = new ArrayList<User>();
	}
	
	public void add_game(int place, double score) {
		avg_score = (avg_score * (wins + losses) + score) / (wins + losses + 1);
		if(place == 1) {
			wins++;
		}
		else {
			losses++;
		}
		win_pct = wins * 1.0 / (wins + losses);
	}
	
	public void add_friend(User u) {
		friends.add(u);
		return;
	}
	
	public void remove_friend(User u) {
		friends.remove(u);
		return;
	}	
}
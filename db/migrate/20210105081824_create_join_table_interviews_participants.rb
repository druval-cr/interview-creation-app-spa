class CreateJoinTableInterviewsParticipants < ActiveRecord::Migration[5.1]
  def change
    create_join_table :interviews, :participants do |t|
      # t.index [:interview_id, :participant_id]
      # t.index [:participant_id, :interview_id]
    end
  end
end

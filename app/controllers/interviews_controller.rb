class InterviewsController < ApplicationController
    def index
        interviews = Interview.all.order("updated_at desc")
        map_interview_participants = Hash.new
        map_interview_resumes = Hash.new
        interviews.each do |interview|
            value = ''
            interview.participants.each do |participant|
                value += participant.email + ', '
            end
            map_interview_participants[interview.id] = value[0...-2]
            if interview.resume_file_name
                map_interview_resumes[interview.id] = interview.resume.url(:original, false)
            else
                map_interview_resumes[interview.id] = ""
            end
        end
        render json: {interviews: interviews, map_interview_participants: map_interview_participants, map_interview_resumes: map_interview_resumes}
    end

    def show
        interview = Interview.find(params[:id])
        interview_participants = ""
        interview.participants.each do |participant|
            interview_participants += participant.email + ","
        end
        render json: {interview: interview, participants: interview_participants[0...-1]}
    end

    def create
        puts params
        interview = Interview.new
        interview.title = params[:title]
        interview.start_time = params[:start_time]
        interview.end_time = params[:end_time]
        if !params[:resume].nil?
            interview.resume = params[:resume]
        end
        participant_id_array = Array.new
        participants_emails = params[:participants].split(",")
        participants_emails.each do |email|
            participant = Participant.find_by(email: email)
            if !participant.nil?
                participant_id_array << participant.id
            end
        end
        if participant_id_array.length == 0
            render json: {status: "error", code: 3000, message: "Select participants"}
            return
        end
		participant_id_array.each do |participant_id|
			interview.participants << Participant.find(participant_id)
        end
		valid_attributes = Interview.valid_attributes(interview)
        if not valid_attributes
            render json: {status: "error", code: 3000, message: "Invalid inputs detected."}
			return
		end
		valid_duration = Interview.valid_duration(interview)
        if not valid_duration
            render json: {status: "error", code: 3000, message: "Start time should be less than End time."}
			return
		end
		time_overlap = Interview.time_overlap(interview)
        if time_overlap
            render json: {status: "error", code: 3000, message: "Time overlap occured."}
			return
		end
        interview.save
		t = Time.now
		current = DateTime.new(t.year,t.month,t.day,t.hour,t.min,t.sec).to_i
        delay_time = interview.start_time.utc.to_i - current - 1800
        puts delay_time
		InterviewReminderJob.set(:wait => delay_time).perform_later(interview.id)
        render json: {interview: interview, code: 200}
    end

    def update
        interview = Interview.find(params[:id])
        currInterview = Interview.new
        currInterview.title = params[:title]
        currInterview.start_time = params[:start_time]
        currInterview.end_time = params[:end_time]
        currInterview.id = params[:id]
        if !params[:resume].nil?
            currInterview.resume = params[:resume]
        end
        participant_id_array = Array.new
        participants_emails = params[:participants].split(",")
        participants_emails.each do |email|
            participant = Participant.find_by(email: email)
            if !participant.nil?
                participant_id_array << participant.id
            end
        end
        if participant_id_array.length == 0
            render json: {status: "error", code: 3000, message: "Select participants"}
            return
        end
		participant_id_array.each do |participant_id|
			currInterview.participants << Participant.find(participant_id)
		end
		valid_attributes = Interview.valid_attributes(currInterview)
		if not valid_attributes
            render json: {status: "error", code: 3000, message: "Invalid inputs detected."}
			return
		end
		valid_duration = Interview.valid_duration(currInterview)
		if not valid_duration
            render json: {status: "error", code: 3000, message: "Start time should be less than End time."}
			return
		end
		time_overlap = Interview.time_overlap(currInterview)
		if time_overlap
            render json: {status: "error", code: 3000, message: "Time overlap occured."}
			return
		end
		prev_start_time = interview.start_time
		interview.update(title: currInterview.title, start_time: currInterview.start_time,
            end_time: currInterview.end_time, participants: currInterview.participants, resume: currInterview.resume)
        if prev_start_time != interview.start_time
            InterviewUpdateJob.perform_later(interview.id)
        end
		render json: {interview: interview, code: 200}
    end
    
    def destroy
		interview = Interview.find(params[:id])
		interview.destroy
		render json: {interview: interview, code: 200}
	end
end

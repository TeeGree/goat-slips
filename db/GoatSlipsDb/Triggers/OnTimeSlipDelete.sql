CREATE TRIGGER [OnTimeSlipDelete]
	ON [dbo].[TimeSlip]
	FOR DELETE
	AS
	BEGIN
		SET NOCOUNT ON

		INSERT INTO TimeSlipLog
		(
			[UpdateType],
			[OldHours], 
			[OldMinutes], 
			[OldDate], 
			[OldUserId], 
			[OldProjectId], 
			[OldTaskId], 
			[OldLaborCodeId], 
			[OldDescription],
			[NewHours], 
			[NewMinutes], 
			[NewDate], 
			[NewUserId], 
			[NewProjectId], 
			[NewTaskId], 
			[NewLaborCodeId], 
			[NewDescription]
		)
		SELECT
			'D',
			d.[Hours], 
			d.[Minutes], 
			d.[Date], 
			d.[UserId], 
			d.[ProjectId], 
			d.[TaskId], 
			d.[LaborCodeId], 
			d.[Description],
			NULL, 
			NULL, 
			NULL, 
			NULL, 
			NULL, 
			NULL, 
			NULL, 
			NULL
		FROM deleted d
	END

CREATE TABLE [dbo].[TimeSlipLog]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [UpdateType] VARCHAR(1) NOT NULL,
	[OldHours] TINYINT NULL, 
    [OldMinutes] TINYINT NULL, 
    [OldDate] DATE NULL, 
    [OldUserId] INT NULL, 
    [OldProjectId] INT NULL, 
    [OldTaskId] INT NULL, 
    [OldLaborCodeId] INT NULL, 
    [OldDescription] VARCHAR(200) NULL,
    [NewHours] TINYINT NULL DEFAULT 0, 
    [NewMinutes] TINYINT NULL DEFAULT 0, 
    [NewDate] DATE NULL, 
    [NewUserId] INT NULL, 
    [NewProjectId] INT NULL, 
    [NewTaskId] INT NULL, 
    [NewLaborCodeId] INT NULL, 
    [NewDescription] VARCHAR(200) NULL,
	[TimeStamp] DateTime2 NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT CK_UpdateType CHECK (UpdateType IN ('C', 'U', 'D'))
)

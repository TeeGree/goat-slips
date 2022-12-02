CREATE TABLE [dbo].[Query]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Name] VARCHAR(50) NOT NULL,
	[OwnerUserId] INT NOT NULL, 
	[UserId] INT NULL,
	[ProjectId] INT NULL, 
    [TaskId] INT NULL, 
    [LaborCodeId] INT NULL,
	[FromDate] DATE NULL, 
	[ToDate] DATE NULL, 
	CONSTRAINT [FK_Query_OwnerUser] FOREIGN KEY ([OwnerUserId]) REFERENCES [User]([Id]),
	CONSTRAINT [FK_Query_User] FOREIGN KEY ([UserId]) REFERENCES [User]([Id]),
    CONSTRAINT [FK_Query_Project] FOREIGN KEY ([ProjectId]) REFERENCES [Project]([Id]),
    CONSTRAINT [FK_Query_Task] FOREIGN KEY ([TaskId]) REFERENCES [Task]([Id]),
    CONSTRAINT [FK_Query_LaborCode] FOREIGN KEY ([LaborCodeId]) REFERENCES [LaborCode]([Id]),
	CONSTRAINT [UC_Query_Name] UNIQUE ([OwnerUserId], [Name])
)

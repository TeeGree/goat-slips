CREATE TABLE [dbo].[Project]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [Name] VARCHAR(100) NOT NULL,
	[Rate] DECIMAL(18,2) NOT NULL DEFAULT(0),
	[FirstName] VARCHAR(50) NULL,
	[LastName] VARCHAR(50) NULL,
	[BusinessName] VARCHAR(100) NULL,
	[Email] VARCHAR(70) NULL,
	[Address1] VARCHAR(100) NULL,
	[Address2] VARCHAR(100) NULL,
	[City] VARCHAR(50) NULL,
	[State] VARCHAR(2) NULL,
	[Zip] INT NULL,
	[ZipExtension] INT NULL,
	CONSTRAINT [CK_Project_Name] CHECK (([FirstName] IS NULL AND [LastName] IS NULL) OR [BusinessName] IS NULL),
	CONSTRAINT [CK_Project_Zip] CHECK (LEN([Zip]) <= 5),
	CONSTRAINT [CK_Project_ZipExtension] CHECK (LEN([ZipExtension]) <= 4)
)

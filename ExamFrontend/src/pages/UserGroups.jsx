import { CreateUserCard } from "../components/cardType/CreateUserCard";

export const UserGroups = () => {
	return (
		<div
			className="UserGroupsOverall">

			<div
				className="CardArea">
				<CreateUserCard></CreateUserCard>
				{/* <CreateUserCard
					onClick={() => { setIsCreateModalOpen(true) }}></CreateUserCard> */}

				{/* {listExams.map((exam) => (
					<ExamCard
						key={exam.id}
						exam={exam}
						onClick={() => { setSelectedExam(exam) }}
					/>
				))} */}
			</div>

			{/* {isCreateModalOpen && (
				<CreateExamModal
					onClose={() => setIsCreateModalOpen(false)}
					onExamCreated={fetchExams} />
			)}

			{SelectedExam && (
				<ExamDetailsModal
					exam={SelectedExam}
					onClose={() => setSelectedExam(false)}
					onQuestionsUploaded={fetchExams} />
			)} */}
		</div>
	);
}

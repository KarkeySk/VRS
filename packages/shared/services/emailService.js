export const emailService = {
    buildBookingApprovalMessage: ({ userEmail, bookingId, dateTime, message }) => {
        if (!userEmail) throw new Error('Booking approval email requires a user email')
        if (!bookingId) throw new Error('Booking approval email requires a booking id')

        return {
            to: userEmail,
            subject: 'Booking approved',
            bookingId,
            dateTime,
            message: message || 'Your booking has been approved.',
        }
    },

    sendBookingApprovalEmail: async (details) => {
        return emailService.buildBookingApprovalMessage(details)
    },
}

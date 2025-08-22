import { useEffect, useState, useRef } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Loading from '@/components/shared/Loading'
import Container from '@/components/shared/Container'
import Avatar, { AvatarProps } from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import { HiCheck, HiOutlineEye, HiX, HiTag } from 'react-icons/hi'
import {
    addProjectActivity,
    fetchProjectActivities,
} from '../ProjectView/api/api'

type Comment = {
    id: string
    name: string
    img: string
    time: string
    comment: string
    actionType?: string
}

const TimelineAvatar = ({ children, ...rest }: AvatarProps) => {
    return (
        <Avatar {...rest} size={30} shape="circle">
            {children}
        </Avatar>
    )
}

const StatusTag = ({ status, time }: { status: string; time: string }) => {
    const getTagStyle = () => {
        switch (status.toLowerCase()) {
            case 'approval':
            case 'approved':
                return {
                    bg: 'bg-emerald-500',
                    icon: <HiCheck className="text-white" />,
                    text: 'Approved',
                }
            case 'check':
            case 'checked':
                return {
                    bg: 'bg-yellow-500',
                    icon: <HiOutlineEye className="text-white" />,
                    text: 'Checked',
                }
            case 'reject':
            case 'rejected':
                return {
                    bg: 'bg-red-500',
                    icon: <HiX className="text-white" />,
                    text: 'Rejected',
                }
            default:
                return {
                    bg: 'bg-blue-500',
                    icon: <HiTag className="text-white" />,
                    text: 'General',
                }
        }
    }

    const tagStyle = getTagStyle()

    return (
        <div className="flex items-center">
            <Tag
                prefix
                className={`${tagStyle.bg} text-white mr-2 rtl:ml-2`}
                prefixClass={tagStyle.bg}
            >
                <span className="flex items-center">
                    <span className="mr-1">{tagStyle.icon}</span>
                    {tagStyle.text}
                </span>
            </Tag>
            <span className="text-xs text-gray-500 dark:text-gray-400">
                {time}
            </span>
        </div>
    )
}

const CommentItem = ({ comment }: { comment: Comment }) => {
    return (
        <div className="flex mb-4">
            <div className="flex-shrink-0 mr-3">
                <TimelineAvatar src={comment.img} />
            </div>
            <div className="flex-1">
                <div className="flex items-center mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mr-2">
                        {comment.name}
                    </span>
                    <StatusTag
                        status={comment.actionType || 'general'}
                        time={comment.time}
                    />
                </div>
                <p className="text-gray-800 dark:text-gray-200 pl-1">
                    {comment.comment}
                </p>
            </div>
        </div>
    )
}

const ActivitySection = ({
    projectId,
    refresh = false,
}: {
    projectId: string
    refresh?: boolean
}) => {
    const [loading, setLoading] = useState(true)
    const [comments, setComments] = useState<Comment[]>([])
    const [commenting, setCommenting] = useState(false)
    const commentInput = useRef<HTMLInputElement>(null)
    const [currentUserImage, setCurrentUserImage] = useState<string>('')

    useEffect(() => {
        if (projectId) {
            fetchData()
        }
    }, [projectId, refresh])

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await fetchProjectActivities(projectId)
            const commentsData = response.data.data || []

            const formattedComments = commentsData.map((item: any) => {
                const user = item.user || {}
                const userName =
                    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                    'Unknown User'
                setCurrentUserImage(user.profileImage)
                return {
                    id: item._id,
                    name: userName,
                    img: user.profileImage
                        ? user.profileImage
                        : '/img/avatars/thumb-1.jpg',
                    time: item.createdAt
                        ? new Date(item.createdAt).toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true,
                              day: 'numeric',
                              month: 'short',
                          })
                        : 'Just now',
                    comment: item.content || '',
                    actionType: item.actionType || 'general',
                }
            })

            setComments(formattedComments)
        } catch (error) {
            console.error('Failed to fetch comments:', error)
        } finally {
            setLoading(false)
        }
    }

    const submitComment = async () => {
        const message = commentInput.current?.value
        if (!message?.trim() || !projectId) return

        try {
            setCommenting(true)

            const tempComment = {
                id: Date.now().toString(),
                name: 'You',
                img: '/img/avatars/thumb-1.jpg',
                time: 'just now',
                comment: message,
                actionType: 'general',
            }

            setComments((prev) => [tempComment, ...prev])
            commentInput.current && (commentInput.current.value = '')

            await addProjectActivity(projectId, message)
            await fetchData()
        } catch (error) {
            console.error('Failed to post comment:', error)
            setComments((prev) =>
                prev.filter((comment) => comment.id !== Date.now().toString()),
            )
        } finally {
            setCommenting(false)
        }
    }

    return (
        <Container className="h-full">
            <Loading loading={loading}>
                <AdaptableCard bodyClass="p-5">
                    <h4 className="text-lg font-semibold mb-4">Activity</h4>

                    <div className="mb-6">
                        {comments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))}
                    </div>

                    <div className="mt-6 mb-3 flex flex-auto">
                        <TimelineAvatar src={currentUserImage} />
                        <div className="ml-4 rtl:mr-4 w-full">
                            <Input
                                ref={commentInput}
                                textArea
                                placeholder="Leave a comment"
                                disabled={commenting}
                            />
                        </div>
                    </div>
                    <div className="text-right">
                        <Button
                            variant="solid"
                            onClick={submitComment}
                            loading={commenting}
                            disabled={commenting}
                        >
                            Comment
                        </Button>
                    </div>
                </AdaptableCard>
            </Loading>
        </Container>
    )
}

export default ActivitySection

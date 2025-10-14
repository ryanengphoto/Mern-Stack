import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import TextbookUI from '../components/TextbookUI';

const TextbookPage = () =>
{
    return (
        <div>
        <PageTitle />
        <LoggedInName />
        <TextbookUI />
        </div>
    );
}

export default TextbookPage;